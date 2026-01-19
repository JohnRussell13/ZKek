circom zkek.circom --r1cs --wasm

snarkjs ptn bn128 12 pot12_0000.ptau
echo "input_value" | snarkjs ptc pot12_0000.ptau pot12_0001.ptau

snarkjs pt2 pot12_0001.ptau pot12_final.ptau

snarkjs g16s zkek.r1cs pot12_final.ptau zkek_0000.zkey
echo "input_value" | snarkjs zkc zkek_0000.zkey zkek_0001.zkey
snarkjs zkev zkek_0001.zkey verification_key.json

rm pot12_0000.ptau pot12_0001.ptau pot12_final.ptau
rm zkek_0000.zkey
