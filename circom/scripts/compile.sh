#!/usr/bin/env bash
set -e

# Generate keys
mkdir -p build/zkey
cd build/zkey

snarkjs ptn bn128 15 pot12_0000.ptau
echo "input_value" | snarkjs ptc pot12_0000.ptau pot12_0001.ptau

snarkjs pt2 pot12_0001.ptau pot12_final.ptau

rm pot12_0000.ptau pot12_0001.ptau

# Withdraw
cd ..
mkdir -p r1cs
cd r1cs
circom ../../circuits/withdraw.circom --r1cs --wasm

cd ../zkey
snarkjs g16s ../r1cs/withdraw.r1cs pot12_final.ptau withdraw_0000.zkey
echo "input_value" | snarkjs zkc withdraw_0000.zkey withdraw_0001.zkey

snarkjs zkev withdraw_0001.zkey withdraw_verification_key.json

rm withdraw_0000.zkey

# Deposit
cd ../r1cs
circom ../../circuits/deposit.circom --r1cs --wasm

cd ../zkey
snarkjs g16s ../r1cs/deposit.r1cs pot12_final.ptau deposit_0000.zkey
echo "input_value" | snarkjs zkc deposit_0000.zkey deposit_0001.zkey

snarkjs zkev deposit_0001.zkey deposit_verification_key.json

rm deposit_0000.zkey

# rm pot12_final.ptau
