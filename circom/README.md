# Circom circuit

This repository contains a Circom circuit and the build artifacts needed to generate proofs.

## Structure

circom/
├── build/
│ ├── proof/ # proof + public inputs 
│ ├── r1cs/ # compiled circuit + wasm + JS 
│ └── zkey/ # proving and verification keys 
├── circuits/ # Circom source files 
├── inputs/ # JSON input files 
├── scripts/ # build scripts 
├── package.json 
└── README.md

## Requirements
- Node.js + npm
- circom
- snarkjs

All scripts should be run from the circom directory (i.e. not from the mono-repo root, or from any subdirectories).

## Setup

Install dependencies:

```bash
./scripts/setup.sh

This will download node_modules for circomlib.

## Compile

Compile circom circuit and generate keys:

```bash
./scripts/compile.sh

## Prove

Generate proof for your inputs:

```bash
./scripts/prove.sh
