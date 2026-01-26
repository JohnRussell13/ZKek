import { pool } from "../src/common/db.js";
import * as circomlibjs from "circomlibjs";

const MERKLE_DEPTH = 20;

function hash(poseidon: any, x: string[]) {
  const F = poseidon.F;
  return F.toString(poseidon(x));
}

function generateZeroHashes(merkleDepth: number, poseidon: any): string[] {
  const zeros: string[] = [];
  zeros[0] = hash(poseidon, ["0", "7"]);

  for (let i = 1; i <= merkleDepth; i++) {
    zeros[i] = hash(poseidon, [zeros[i - 1], zeros[i - 1]]);
  }
  return zeros;
}

function initTree(zeros: string[], merkleDepth: number): string[][] {
  const tree: string[][] = [];
  for (let i = 0; i <= merkleDepth; i++) {
    const row: string[] = [];
    for (let j = 0; j < 2 ** (merkleDepth - i); j++) {
      row[j] = zeros[i];
    }
    tree[i] = row;
  }
  return tree;
}

async function populateDatabase() {
  const client = await pool.connect();

  try {
    console.log("Building Poseidon hash...");
    const poseidon = await circomlibjs.buildPoseidon();

    console.log("Generating zero hashes...");
    const zeros = generateZeroHashes(MERKLE_DEPTH, poseidon);

    console.log("Initializing tree...");
    const tree = initTree(zeros, MERKLE_DEPTH);

    console.log("Starting database transaction...");
    await client.query("BEGIN");

    // Clear existing data
    console.log("Clearing existing merkle_nodes...");
    await client.query("DELETE FROM merkle_nodes");

    // Insert all tree nodes
    console.log("Inserting tree nodes...");
    let insertCount = 0;

    for (let level = 0; level <= MERKLE_DEPTH; level++) {
      const nodesAtLevel = tree[level].length;
      console.log(`Inserting level ${level} with ${nodesAtLevel} nodes...`);

      for (let idx = 0; idx < nodesAtLevel; idx++) {
        const hash = tree[level][idx];
        await client.query("INSERT INTO merkle_nodes (level, idx, hash) VALUES ($1, $2, $3)", [level, idx, hash]);
        insertCount++;
      }
    }

    await client.query("COMMIT");
    console.log(`Successfully inserted ${insertCount} nodes into the database`);

    // Verify insertion
    const result = await client.query("SELECT COUNT(*) FROM merkle_nodes");
    console.log(`Total nodes in database: ${result.rows[0].count}`);

    // Show root hash
    const rootResult = await client.query("SELECT hash FROM merkle_nodes WHERE level = $1 AND idx = 0", [MERKLE_DEPTH]);
    console.log(`Merkle root hash: ${rootResult.rows[0].hash}`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error populating database:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

populateDatabase()
  .then(() => {
    console.log("Database population completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to populate database:", error);
    process.exit(1);
  });
