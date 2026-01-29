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
  const randomFee = Math.floor(Math.random() * 10001);

  it("Initialize", async () => {
    const tx = await program.methods
      .initialize(randomFee)
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
    expect(globalState.fee).to.equal(randomFee);

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
      30, 197, 6, 37, 7, 208, 151, 48, 115, 146, 22, 145, 128, 12, 29, 76, 217,
      227, 214, 76, 10, 216, 131, 183, 234, 193, 36, 55, 215, 26, 248, 164, 25,
      207, 44, 172, 53, 48, 58, 79, 89, 36, 41, 218, 47, 45, 153, 101, 188, 164,
      122, 206, 93, 155, 132, 125, 55, 104, 195, 21, 11, 9, 131, 223, 39, 86,
      65, 236, 52, 77, 108, 79, 140, 151, 225, 68, 233, 127, 20, 82, 80, 110,
      188, 229, 37, 59, 214, 81, 214, 72, 20, 235, 26, 238, 249, 31, 23, 209,
      39, 192, 200, 105, 110, 234, 95, 81, 119, 5, 124, 175, 139, 130, 122, 73,
      111, 249, 26, 151, 147, 179, 53, 184, 67, 138, 82, 31, 250, 202, 22, 175,
      50, 89, 235, 154, 2, 17, 73, 4, 180, 160, 124, 224, 178, 124, 249, 161,
      54, 92, 195, 252, 73, 73, 143, 163, 181, 240, 110, 131, 90, 218, 24, 172,
      122, 187, 118, 247, 193, 210, 221, 132, 70, 51, 211, 144, 127, 142, 125,
      73, 4, 130, 224, 24, 155, 9, 116, 236, 150, 243, 224, 73, 49, 154, 41, 96,
      252, 106, 10, 23, 107, 122, 64, 94, 9, 175, 1, 215, 243, 236, 254, 243,
      161, 177, 85, 82, 24, 140, 22, 215, 39, 131, 160, 197, 45, 146, 16, 65,
      11, 59, 61, 186, 22, 74, 198, 150, 135, 38, 30, 62, 1, 190, 151, 235, 87,
      189, 252, 85, 179, 122, 20, 173, 79, 24, 225, 18, 159, 9,
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

  it.only("Withdraw with random data", async () => {
    const newRoot = [
      24, 58, 40, 122, 172, 245, 188, 179, 223, 225, 18, 74, 62, 59, 106, 156,
      224, 241, 70, 177, 216, 44, 88, 132, 160, 226, 202, 19, 85, 155, 48, 10,
    ];
    const nullifier = [
      21, 229, 123, 82, 68, 241, 120, 110, 105, 216, 135, 207, 110, 188, 94, 43,
      37, 243, 252, 11, 117, 32, 88, 48, 41, 188, 55, 121, 130, 166, 101, 54,
    ];

    const proof = [
      33, 249, 32, 127, 43, 17, 116, 161, 5, 226, 79, 134, 119, 1, 34, 76, 127,
      89, 170, 233, 97, 89, 50, 195, 191, 42, 21, 72, 88, 200, 0, 101, 31, 18,
      135, 7, 70, 28, 11, 218, 135, 55, 92, 95, 24, 227, 17, 4, 34, 225, 74, 57,
      212, 51, 177, 76, 52, 213, 104, 96, 85, 9, 187, 160, 45, 180, 31, 167,
      178, 250, 71, 155, 222, 192, 106, 41, 206, 47, 234, 12, 243, 248, 212, 26,
      126, 213, 193, 68, 100, 231, 110, 17, 54, 238, 31, 70, 4, 54, 84, 18, 152,
      255, 76, 228, 161, 133, 90, 60, 192, 241, 25, 15, 94, 97, 24, 140, 221,
      74, 251, 56, 252, 69, 225, 226, 82, 61, 252, 46, 45, 227, 172, 244, 224,
      50, 251, 174, 230, 253, 20, 73, 82, 33, 198, 138, 147, 110, 75, 218, 96,
      24, 174, 158, 225, 25, 140, 1, 145, 11, 221, 84, 26, 237, 250, 112, 226,
      148, 105, 62, 158, 61, 92, 186, 33, 130, 80, 95, 43, 244, 185, 229, 246,
      100, 48, 166, 15, 18, 188, 188, 36, 23, 106, 169, 12, 180, 27, 10, 147,
      184, 135, 190, 51, 69, 162, 188, 193, 117, 183, 57, 163, 43, 91, 10, 113,
      107, 112, 247, 131, 52, 0, 108, 29, 128, 84, 180, 24, 164, 184, 248, 183,
      226, 95, 124, 65, 169, 184, 90, 221, 197, 155, 96, 23, 8, 45, 244, 59,
      154, 105, 107, 97, 254, 144, 221, 229, 250, 250, 77,
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
