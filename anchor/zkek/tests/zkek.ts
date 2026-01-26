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
    const zeroRoot = new Array(32).fill(0);
    expect(Array.from(merkleTree.activeRoots[0])).to.deep.equal(zeroRoot);

    console.log("Global state admin:", globalState.admin.toBase58());
    console.log("Global state fee:", globalState.fee);
    console.log("Merkle tree leaf index:", merkleTree.currentLeafIndex);
  });

  it("Deposit with random data", async () => {
    // Generate random new root (32 bytes)
    const newRoot = Array.from(crypto.randomBytes(32));

    // Old root must match current active root (initially all zeros)
    const oldRoot = new Array(32).fill(0);

    // First deposit should have leaf_index = 1 (current_leaf_index + 1)
    const leafIndex = 1;

    // Get signer balance before deposit
    const balanceBefore = await provider.connection.getBalance(
      provider.wallet.publicKey,
    );

    const tx = await program.methods
      .deposit(newRoot, oldRoot, leafIndex)
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
