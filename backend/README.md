## Prerequisites

- Node.js (v22 or higher recommended)
- Docker & Docker Compose
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy the example environment file and fill in the values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

### 3. Start Database

Start the PostgreSQL database using Docker Compose:

```bash
docker compose up -d
```

### 4. Run Migrations

Create the database schema:

```bash
npm run migrate up
```

### 5. Populate Database

Initialize the merkle tree with zero hashes:

```bash
npm run populate
```

### 6. Start the Server

For development (with auto-reload):

```bash
npm run dev
```
