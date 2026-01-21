const fs = require("fs");
const circomlibjs = require("circomlibjs");

function getMerkle(merkleDepth, merkleIndex, publicKey, poseidon) {
  const F = poseidon.F;
  const merkleSeed = 67;

  const leaves = [];

  for (let i = 0; i < 2 ** merkleDepth; i++) {
    leaves[i] =
      i === merkleIndex ? F.toString(poseidon([publicKey])) : i.toString();
  }

  const tree = [];
  tree[0] = leaves;
  for (let i = 1; i <= merkleDepth; i++) {
    const row = [];
    for (let j = 0; j < 2 ** (merkleDepth - i); j++) {
      row[j] = F.toString(
        poseidon([tree[i - 1][2 * j], tree[i - 1][2 * j + 1]]),
      );
    }
    tree[i] = row;
  }

  return tree;
}

async function main() {
  const poseidon = await circomlibjs.buildPoseidon();
  const F = poseidon.F;

  const secretKey = "123";
  const merkleIndex = 2;
  const merkleDepth = 3;

  const publicKey = F.toString(poseidon([secretKey]));

  const tree = getMerkle(merkleDepth, merkleIndex, publicKey, poseidon);

  const merklePath = [];
  let tempIndex = merkleIndex;
  for (let i = 0; i < merkleDepth; i++) {
    const sel = 1 - (tempIndex & 1);
    tempIndex = tempIndex >> 1;

    merklePath[i] = tree[i][(tempIndex << 1) + sel];
  }
  const merkleRoot = tree[merkleDepth][0];

  const input = {
    secretKey,
    publicKey,
    merkleIndex,
    merklePath,
    merkleRoot,
  };

  fs.writeFileSync(
    "../../circom/inputs/inputs.json",
    JSON.stringify(input, null, 2),
  );
  console.log("Input written to input.json");
  console.log(input);
}

main();
