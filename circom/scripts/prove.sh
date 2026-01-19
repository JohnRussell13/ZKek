#!/usr/bin/env bash
set -e

mkdir -p build/proof
cd build/proof

snarkjs g16f ../../inputs/inputs.json ../r1cs/zkek_js/zkek.wasm ../zkey/zkek_0001.zkey proof.json public.json
