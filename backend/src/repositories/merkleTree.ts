import { pool } from "../common/db";

export const getMerkleNodeByLevelAndHash = async (level: number, hash: string) => {
  const { rows } = await pool.query(
    `
    SELECT level, idx, hash
    FROM merkle_nodes
    WHERE level = $1 AND hash = $2
    ORDER BY idx ASC
    LIMIT 1;
    `,
    [level, hash],
  );
  return rows[0];
};

export const getMerkleNodeByLevelAndIdx = async (level: number, idx: number) => {
  const { rows } = await pool.query(
    `
    SELECT level, idx, hash
    FROM merkle_nodes
    WHERE level = $1 AND idx = $2;
    `,
    [level, idx],
  );
  return rows[0];
};

export const updateMerkleNode = async (level: number, idx: number, hash: string) => {
  await pool.query(
    `
    UPDATE merkle_nodes
    SET hash = $3
    WHERE level = $1 AND idx = $2;
    `,
    [level, idx, hash],
  );
};
