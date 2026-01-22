#!/usr/bin/env bash
set -e

snarkjs g16v build/zkey/verification_key.json build/proof/public.json build/proof/proof.json
