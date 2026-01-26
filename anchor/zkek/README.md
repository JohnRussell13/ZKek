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
surfpool start
```

### 3. Run the tests

```bash
anchor test --skip-local-validator --skip-deploy
```
