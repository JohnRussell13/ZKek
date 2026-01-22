const fs = require("fs");
const circomlibjs = require("circomlibjs");

function hash(poseidon, x) {
  const F = poseidon.F;

  return F.toString(poseidon(x));
}

function generateZeroHashes(merkleDepth, poseidon) {
  const zeros = [];
  zeros[0] = hash(poseidon, ["0", "7"]);

  for (let i = 1; i <= merkleDepth; i++) {
    zeros[i] = hash(poseidon, [zeros[i - 1], zeros[i - 1]]);
  }
  return zeros;
}

function adjustCache(leaf, index, tree, zeros, cache, poseidon, merkleDepth) {
  let tempIndex = index;
  let tempValue = leaf;

  const newCache = [];
  const newTree = tree;

  newCache[0] = leaf;
  newTree[0][tempIndex] = leaf;
  for (let i = 0; i < merkleDepth; i++) {
    tempValue = newCache[i];
    const sel = tempIndex & 1;
    tempIndex = tempIndex >> 1;

    newCache[i + 1] =
      sel === 0
        ? hash(poseidon, [tempValue, zeros[i]])
        : hash(poseidon, [cache[i], tempValue]);
    newTree[i + 1][tempIndex] = newCache[i + 1];
  }

  return [newCache, newTree];
}

function init_tree(zeros, merkleDepth) {
  const tree = [];
  for (let i = 0; i <= merkleDepth; i++) {
    let row = [];
    for (let j = 0; j < 2 ** (merkleDepth - i); j++) {
      row[j] = zeros[i];
    }
    tree[i] = row;
  }
  return tree;
}

function getPath(index, tree, merkleDepth) {
  const path = [];

  let tempIndex = index;
  for (let i = 0; i < merkleDepth; i++) {
    const sel = tempIndex & 1;

    path[i] = sel === 0 ? tree[i][tempIndex + 1] : tree[i][tempIndex - 1];

    tempIndex = tempIndex >> 1;
  }
  return path;
}

async function main() {
  const poseidon = await circomlibjs.buildPoseidon();

  const secretKey = "124";
  const merkleIndex = 2;
  const merkleDepth = 3;

  const publicKey = hash(poseidon, [secretKey, "6"]);

  const leaves = ["1", "2", publicKey, "4", "5", "6", "7", "8"];

  const zeros = generateZeroHashes(merkleDepth, poseidon);
  let cache = generateZeroHashes(merkleDepth, poseidon);

  let tree;
  tree = init_tree(zeros, merkleDepth);

  let leaf;

  for (let i = 0; i < 2 ** merkleDepth; i++) {
    // console.log(tree);
    // console.log(cache);
    // console.log("-----------");

    leaf = hash(poseidon, [`${leaves[i]}`, "7"]);
    [cache, tree] = adjustCache(
      leaf,
      i,
      tree,
      zeros,
      cache,
      poseidon,
      merkleDepth,
    );
  }

  const merklePath = getPath(merkleIndex, tree, merkleDepth);
  const merkleRoot = tree[merkleDepth][0];
  const nullifierHash = hash(poseidon, [secretKey]);

  const input = {
    secretKey,
    merkleIndex,
    merklePath,
    merkleRoot,
    nullifierHash,
  };

  fs.writeFileSync(
    "../../circom/inputs/inputs.json",
    JSON.stringify(input, null, 2),
  );
  console.log("Input written to input.json");

  console.log(tree);
  console.log(input);
}

main();
