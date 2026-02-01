import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Zkek } from "../target/types/zkek";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";
import crypto from "crypto";

describe("zkek", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.zkek as Program<Zkek>;

  // PDAs
  const [globalStatePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("GLOBAL_STATE")],
    program.programId,
  );

  const [merkleTreePda] = PublicKey.findProgramAddressSync(
    [Buffer.from("MERKLE_TREE")],
    program.programId,
  );

  // Get program data account (for upgrade authority check)
  const [programDataPda] = PublicKey.findProgramAddressSync(
    [program.programId.toBuffer()],
    new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111"),
  );

  // Random fee between 0-10000 basis points
  // const randomFee = Math.floor(Math.random() * 10001);

  it.only("Initialize", async () => {
    const tx = await program.methods
      .initialize(50)
      .accounts({
        authority: provider.wallet.publicKey,
        programData: programDataPda,
      })
      .rpc();

    console.log("Initialize tx:", tx);

    // Fetch and verify global state
    const globalState = await program.account.globalState.fetch(globalStatePda);
    expect(globalState.admin.toBase58()).to.equal(
      provider.wallet.publicKey.toBase58(),
    );
    // expect(globalState.fee).to.equal(randomFee);

    // Fetch and verify merkle tree initial state
    const merkleTree = await program.account.merkleTree.fetch(merkleTreePda);
    expect(merkleTree.currentLeafIndex).to.equal(0);
    expect(merkleTree.currentRootIndex).to.equal(0);

    // First active root should be zero root
    // const zeroRoot = new Array(32).fill(0);
    // expect(Array.from(merkleTree.activeRoots[0])).to.deep.equal(zeroRoot);

    console.log("Global state admin:", globalState.admin.toBase58());
    console.log("Global state fee:", globalState.fee);
    console.log("Merkle tree leaf index:", merkleTree.currentLeafIndex);
  });

  it("Deposit with random data", async () => {
    const newRoot = [
      24, 58, 40, 122, 172, 245, 188, 179, 223, 225, 18, 74, 62, 59, 106, 156,
      224, 241, 70, 177, 216, 44, 88, 132, 160, 226, 202, 19, 85, 155, 48, 10,
    ];
    let currentRoot = [
      20, 112, 226, 52, 151, 160, 106, 71, 24, 144, 226, 234, 238, 41, 81, 211,
      133, 126, 71, 4, 2, 78, 91, 71, 0, 217, 54, 44, 32, 162, 160, 217,
    ];

    const leafIndex = 0;

    const proof = [
      11, 152, 16, 239, 145, 120, 66, 248, 94, 182, 36, 76, 88, 16, 48, 176,
      214, 113, 140, 119, 131, 144, 31, 239, 115, 237, 141, 228, 71, 127, 2,
      132, 27, 183, 127, 15, 246, 159, 128, 191, 39, 102, 133, 57, 66, 245, 50,
      55, 170, 244, 206, 48, 188, 140, 185, 77, 16, 185, 37, 231, 143, 3, 102,
      217, 15, 9, 104, 86, 13, 158, 113, 80, 56, 141, 211, 52, 112, 62, 199,
      165, 110, 204, 199, 89, 115, 232, 91, 157, 183, 43, 179, 43, 132, 181, 57,
      58, 38, 177, 216, 196, 3, 157, 248, 192, 197, 61, 206, 244, 66, 212, 15,
      217, 6, 199, 165, 213, 80, 67, 167, 182, 35, 88, 63, 17, 231, 96, 193,
      107, 0, 91, 167, 232, 179, 143, 233, 163, 41, 21, 56, 218, 20, 178, 65,
      133, 162, 241, 196, 235, 208, 121, 114, 247, 165, 80, 135, 207, 77, 108,
      164, 92, 47, 99, 254, 221, 206, 222, 174, 32, 89, 32, 233, 114, 23, 127,
      66, 195, 168, 204, 46, 128, 99, 226, 62, 225, 103, 136, 196, 21, 215, 213,
      85, 134, 15, 139, 52, 182, 197, 140, 199, 150, 179, 149, 81, 95, 240, 199,
      3, 29, 164, 65, 150, 28, 107, 186, 156, 23, 23, 167, 21, 27, 133, 213,
      132, 187, 22, 211, 127, 161, 190, 176, 191, 30, 207, 120, 9, 134, 13, 65,
      102, 190, 180, 191, 250, 100, 12, 118, 110, 152, 229, 45, 121, 255, 183,
      33, 173, 246,
    ];

    // Get signer balance before deposit
    const balanceBefore = await provider.connection.getBalance(
      provider.wallet.publicKey,
    );

    const tx = await program.methods
      .deposit(newRoot, currentRoot, leafIndex, proof)
      .accounts({
        signer: provider.wallet.publicKey,
      })
      .rpc();

    console.log("Deposit tx:", tx);

    // Fetch and verify updated merkle tree state
    const merkleTree = await program.account.merkleTree.fetch(merkleTreePda);
    expect(merkleTree.currentLeafIndex).to.equal(1);
    expect(merkleTree.currentRootIndex).to.equal(1);

    // New root should be stored at index 1
    expect(Array.from(merkleTree.activeRoots[1])).to.deep.equal(newRoot);

    // Verify 0.1 SOL was transferred (approximately, accounting for tx fees)
    const balanceAfter = await provider.connection.getBalance(
      provider.wallet.publicKey,
    );
    const transferAmount = 100_000_000; // 0.1 SOL in lamports
    expect(balanceBefore - balanceAfter).to.be.greaterThan(transferAmount);

    console.log("New root stored:", Buffer.from(newRoot).toString("hex"));
    console.log("Merkle tree leaf index:", merkleTree.currentLeafIndex);
    console.log("Merkle tree root index:", merkleTree.currentRootIndex);
  });

  it("Withdraw with random data", async () => {
    const newRoot = [
      24, 58, 40, 122, 172, 245, 188, 179, 223, 225, 18, 74, 62, 59, 106, 156,
      224, 241, 70, 177, 216, 44, 88, 132, 160, 226, 202, 19, 85, 155, 48, 10,
    ];
    const nullifier = [
      21, 229, 123, 82, 68, 241, 120, 110, 105, 216, 135, 207, 110, 188, 94, 43,
      37, 243, 252, 11, 117, 32, 88, 48, 41, 188, 55, 121, 130, 166, 101, 54,
    ];

    const proof = [
      46, 198, 229, 159, 190, 220, 253, 44, 134, 101, 178, 72, 254, 108, 47,
      184, 210, 55, 63, 21, 47, 77, 120, 54, 196, 127, 17, 232, 94, 40, 168,
      185, 37, 199, 104, 115, 22, 6, 55, 18, 157, 48, 178, 87, 29, 43, 193, 8,
      116, 218, 240, 241, 39, 207, 152, 184, 30, 88, 39, 193, 145, 171, 107,
      138, 38, 12, 158, 68, 248, 112, 167, 241, 162, 94, 209, 52, 3, 8, 28, 248,
      141, 162, 38, 40, 247, 58, 168, 168, 97, 115, 249, 130, 216, 180, 173, 32,
      34, 86, 74, 202, 112, 126, 175, 89, 69, 16, 134, 8, 91, 252, 26, 150, 77,
      144, 53, 164, 177, 204, 252, 18, 211, 111, 203, 220, 217, 89, 246, 37, 23,
      95, 176, 158, 108, 154, 155, 6, 31, 115, 248, 69, 164, 100, 156, 77, 185,
      105, 16, 238, 50, 83, 62, 54, 239, 201, 75, 104, 36, 219, 212, 66, 33,
      223, 244, 114, 118, 170, 175, 176, 185, 6, 235, 75, 113, 12, 142, 238,
      142, 197, 136, 86, 201, 137, 21, 39, 54, 73, 154, 249, 182, 61, 20, 187,
      0, 42, 156, 88, 80, 162, 99, 111, 23, 212, 160, 189, 147, 87, 107, 163,
      118, 21, 253, 43, 16, 105, 91, 88, 239, 77, 225, 115, 60, 102, 194, 254,
      0, 153, 167, 141, 13, 87, 29, 201, 156, 211, 174, 120, 231, 57, 26, 55,
      145, 95, 118, 220, 223, 37, 234, 127, 89, 157, 162, 3, 229, 207, 92, 242,
    ];

    // Get signer balance before deposit
    const balanceBefore = await provider.connection.getBalance(
      provider.wallet.publicKey,
    );

    const tx = await program.methods
      .withdraw(nullifier, newRoot, proof)
      .accounts({
        signer: provider.wallet.publicKey,
        admin: provider.wallet.publicKey,
      })
      .rpc();

    console.log("Deposit tx:", tx);

    // Fetch and verify updated merkle tree state
    const merkleTree = await program.account.merkleTree.fetch(merkleTreePda);
    expect(merkleTree.currentLeafIndex).to.equal(1);
    expect(merkleTree.currentRootIndex).to.equal(1);

    // New root should be stored at index 1
    expect(Array.from(merkleTree.activeRoots[1])).to.deep.equal(newRoot);

    // Verify 0.1 SOL was transferred (approximately, accounting for tx fees)
    const balanceAfter = await provider.connection.getBalance(
      provider.wallet.publicKey,
    );
    const transferAmount = 100_000_000; // 0.1 SOL in lamports
    expect(balanceBefore - balanceAfter).to.be.greaterThan(transferAmount);

    console.log("New root stored:", Buffer.from(newRoot).toString("hex"));
    console.log("Merkle tree leaf index:", merkleTree.currentLeafIndex);
    console.log("Merkle tree root index:", merkleTree.currentRootIndex);
  });
});
