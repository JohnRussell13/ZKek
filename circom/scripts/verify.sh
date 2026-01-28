#!/usr/bin/env bash
set -e

snarkjs g16v build/zkey/withdraw_verification_key.json build/proof/withdraw_public.json build/proof/withdraw_proof.json

snarkjs g16v build/zkey/deposit_verification_key.json build/proof/deposit_public.json build/proof/deposit_proof.json
