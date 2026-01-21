const fs = require("fs");
const circomlibjs = require("circomlibjs");

async function main() {
  const poseidon = await circomlibjs.buildPoseidon();
  const F = poseidon.F;

  // Example inputs
  const a = 123;
  const b = 67;

  // Poseidon hash
  const hash = poseidon([a, b]);

  // Convert field element to string
  const hashStr = F.toString(hash);

  const input = {
    a: a.toString(),
    b: b.toString(),
    hash: hashStr,
  };

  fs.writeFileSync("input.json", JSON.stringify(input, null, 2));
  console.log("Input written to input.json");
  console.log(input);
}

main();
