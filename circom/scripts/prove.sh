#!/usr/bin/env bash
set -e

mkdir -p build/proof
cd build/proof

snarkjs g16f ../../inputs/withdraw.json ../r1cs/withdraw_js/withdraw.wasm ../zkey/withdraw_0001.zkey withdraw_proof.json withdraw_public.json

snarkjs g16f ../../inputs/deposit.json ../r1cs/deposit_js/deposit.wasm ../zkey/deposit_0001.zkey deposit_proof.json deposit_public.json
