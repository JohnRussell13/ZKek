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

  it.only("Deposit with random data", async () => {
    const newRoot = [
      17, 175, 236, 227, 138, 251, 124, 40, 234, 18, 181, 187, 140, 78, 155,
      137, 163, 170, 10, 137, 66, 67, 141, 152, 227, 7, 253, 119, 38, 148, 238,
      16,
    ];
    let currentRoot = [
      20, 112, 226, 52, 151, 160, 106, 71, 24, 144, 226, 234, 238, 41, 81, 211,
      133, 126, 71, 4, 2, 78, 91, 71, 0, 217, 54, 44, 32, 162, 160, 217,
    ];

    const leafIndex = 0;

    const proof = [
      14, 68, 24, 105, 111, 186, 177, 39, 26, 193, 249, 233, 18, 190, 148, 41,
      70, 66, 91, 29, 179, 103, 12, 179, 14, 36, 93, 245, 199, 145, 115, 224,
      24, 214, 222, 141, 75, 6, 70, 96, 174, 199, 78, 69, 101, 236, 188, 63,
      138, 237, 115, 134, 64, 161, 25, 40, 251, 68, 237, 18, 145, 118, 111, 125,
      13, 61, 197, 158, 36, 199, 8, 0, 131, 211, 80, 253, 20, 41, 199, 123, 53,
      140, 25, 23, 75, 40, 152, 229, 30, 178, 162, 110, 226, 158, 215, 87, 39,
      214, 135, 65, 247, 160, 222, 82, 99, 80, 198, 111, 170, 215, 76, 102, 76,
      75, 70, 26, 218, 212, 204, 245, 156, 132, 101, 239, 110, 214, 219, 24, 32,
      125, 25, 148, 26, 204, 169, 19, 131, 204, 172, 77, 66, 20, 248, 134, 35,
      3, 116, 27, 206, 201, 88, 155, 151, 51, 68, 73, 199, 84, 37, 24, 20, 166,
      44, 43, 130, 196, 175, 142, 153, 34, 85, 24, 109, 229, 233, 219, 6, 217,
      177, 166, 127, 84, 249, 125, 65, 177, 145, 222, 42, 163, 100, 35, 19, 187,
      251, 241, 95, 4, 237, 222, 178, 152, 62, 192, 74, 214, 100, 181, 109, 83,
      51, 16, 113, 221, 201, 31, 149, 145, 112, 134, 249, 125, 127, 33, 45, 242,
      169, 20, 167, 8, 104, 0, 65, 202, 186, 76, 111, 171, 80, 247, 77, 15, 216,
      86, 249, 80, 148, 34, 78, 56, 32, 83, 118, 29, 142, 1,
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
});
