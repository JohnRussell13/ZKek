## Devnet explorer link

Try linking the existing deposits and withdrawals!

https://explorer.solana.com/address/78MWuTNrZVxGBnMop6ZcJmEbM4yQaUHCkDea2B5NnSjB?cluster=devnet

## How It Works

This program implements a privacy-mixer using zk proofs on Solana.

### Initialize

Sets up the program for the first time by creating the global state and Merkle tree accounts. The authority sets:

- Admin account (who receives the fee)
- Fee percentage (in basis points)
- Initial Merkle root (root of empty tree)

### Deposit

Users deposit SOL into the mixer:

1. User transfers a fixed amount of SOL to the Merkle tree account
2. A zk proof verifies that the new Merkle root is correctly computed from the old root
3. The new leaf is added to the tree and the active roots are updated
4. The leaf index increments for the next deposit

### Withdraw

Users withdraw their SOL using a zk proof:

1. User provides a nullifier (prevents double-spending) and a Merkle root
2. A zk proof verifies the user owns a leaf in the tree without revealing which one
3. The program checks the root is still active and the nullifier hasn't been used
4. Funds are transferred to the recipient minus a small fee that goes to the admin

## Prerequisites

```bash
curl --proto '=https' --tlsv1.2 -sSfL https://solana-install.solana.workers.dev | bash
```

## Setup Instructions

### 1. Install and build Dependencies

```bash
npm install
anchor build
```

### 2. Run node with surfpool

```bash
surfpool start --watch
```

### 3. Run the tests

```bash
anchor test --skip-local-validator --skip-deploy
```
