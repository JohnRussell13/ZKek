import { getMerkleNodeByLevelAndHash, getMerkleNodeByLevelAndIdx, updateMerkleNode } from "../repositories/merkleTree.js";
import * as circomlibjs from "circomlibjs";

const LEVEL_ZERO = 0;
const MERKLE_DEPTH = 20;
const EMPTY_LEAF_HASH = "279607406330385469699708956735380224008485527346210613759547827362749687966";

interface MerkleNodeUpdate {
  level: number;
  idx: number;
  hash: string;
}

interface PendingMerkleUpdate {
  leafIndex: number;
  newRoot: string;
  nodeUpdates: MerkleNodeUpdate[];
}

// In-memory storage for pending merkle tree updates
const pendingUpdates = new Map<string, PendingMerkleUpdate>();

export const addNewLeaf = async (leaf: string) => {
  const inserting_leaf = await getMerkleNodeByLevelAndHash(LEVEL_ZERO, EMPTY_LEAF_HASH);

  if (!inserting_leaf) {
    return null;
  }

  const oldRootNode = await getMerkleNodeByLevelAndIdx(MERKLE_DEPTH, 0);
  const oldRoot = oldRootNode.hash;

  const poseidon = await circomlibjs.buildPoseidon();
  const zeros = generateZeroHashes(MERKLE_DEPTH, poseidon);

  // Calculate all sibling indices upfront
  const siblingQueries: Array<{ level: number; idx: number; isRight: boolean }> = [];
  let tempIdx = inserting_leaf.idx;

  for (let level = 0; level < MERKLE_DEPTH; level++) {
    const isRight = !!(tempIdx & 1);
    const siblingIdx = isRight ? tempIdx - 1 : tempIdx + 1;
    siblingQueries.push({ level, idx: siblingIdx, isRight });
    tempIdx = tempIdx >> 1;
  }

  const siblingPromises = siblingQueries.map(({ level, idx }) => getMerkleNodeByLevelAndIdx(level, idx));
  const siblings = await Promise.all(siblingPromises);

  let currentIdx = inserting_leaf.idx;
  let currentHash = leaf;
  const nodeUpdates: MerkleNodeUpdate[] = [];

  nodeUpdates.push({
    level: LEVEL_ZERO,
    idx: currentIdx,
    hash: leaf,
  });

  for (let i = 0; i < MERKLE_DEPTH; i++) {
    const { level, isRight } = siblingQueries[i];
    const siblingHash = siblings[i]?.hash || zeros[level];

    const parentHash = isRight ? hash(poseidon, [siblingHash, currentHash]) : hash(poseidon, [currentHash, siblingHash]);

    const parentIdx = currentIdx >> 1;

    nodeUpdates.push({
      level: level + 1,
      idx: parentIdx,
      hash: parentHash,
    });

    currentIdx = parentIdx;
    currentHash = parentHash;
  }

  const result = {
    leafIndex: inserting_leaf.idx,
    newRoot: currentHash,
    nodeUpdates,
  };

  storePendingUpdate(result.newRoot, result);

  return { leafIndex: inserting_leaf.idx, newRoot: currentHash, currentRoot: oldRoot };
};

export const applyNodeUpdates = async (nodeUpdates: MerkleNodeUpdate[]) => {
  const updatePromises = nodeUpdates.map((update) => updateMerkleNode(update.level, update.idx, update.hash));
  await Promise.all(updatePromises);
};

export const storePendingUpdate = (merkleRoot: string, update: PendingMerkleUpdate) => {
  pendingUpdates.set(merkleRoot, update);
};

export const getPendingUpdate = (merkleRoot: string): PendingMerkleUpdate | undefined => {
  return pendingUpdates.get(merkleRoot);
};

export const removePendingUpdate = (merkleRoot: string): boolean => {
  return pendingUpdates.delete(merkleRoot);
};

export const commitPendingUpdate = async (merkleRoot: string): Promise<boolean> => {
  const pendingUpdate = getPendingUpdate(merkleRoot);

  if (!pendingUpdate) {
    return false;
  }

  await applyNodeUpdates(pendingUpdate.nodeUpdates);
  removePendingUpdate(merkleRoot);

  return true;
};

export const getAllPendingUpdates = (): Map<string, PendingMerkleUpdate> => {
  return pendingUpdates;
};

export const getMerkleProof = async (leaf: string) => {
  const leafNode = await getMerkleNodeByLevelAndHash(LEVEL_ZERO, leaf);

  if (!leafNode) {
    return null;
  }

  const leafIndex = leafNode.idx;

  const siblingQueries: Array<{ level: number; idx: number }> = [];
  let tempIdx = leafIndex;

  for (let level = 0; level < MERKLE_DEPTH; level++) {
    const isRight = !!(tempIdx & 1);
    const siblingIdx = isRight ? tempIdx - 1 : tempIdx + 1;
    siblingQueries.push({ level, idx: siblingIdx });
    tempIdx = tempIdx >> 1;
  }

  const siblingPromises = siblingQueries.map(({ level, idx }) => getMerkleNodeByLevelAndIdx(level, idx));
  const siblings = await Promise.all(siblingPromises);

  const merklePath = siblings.map((sibling) => sibling.hash);

  return {
    leafIndex,
    merklePath,
  };
};

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
