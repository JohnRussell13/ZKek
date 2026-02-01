import { groth16, type CircuitSignals } from "snarkjs";

export interface DepositCircuitInputs extends CircuitSignals {
  publicKey: string;
  merkleIndex: string;
  merklePath: string[];
  merkleRoot: string;
  oldMerkleRoot: string;
}

export interface WithdrawCircuitInputs extends CircuitSignals {
  secretKey: string;
  merkleIndex: string;
  merklePath: string[];
  merkleRoot: string;
  nullifierHash: string;
}

export const makeProof = async (
  proofInput: DepositCircuitInputs | WithdrawCircuitInputs,
) => {
  let wasm: string;
  let zkey: string;

  if ("publicKey" in proofInput) {
    wasm = "/zk-artifacts/deposit.wasm";
    zkey = "/zk-artifacts/deposit_0001.zkey";
  } else {
    wasm = "/zk-artifacts/withdraw.wasm";
    zkey = "/zk-artifacts/withdraw_0001.zkey";
  }

  const { proof, publicSignals } = await groth16.fullProve(
    proofInput,
    wasm,
    zkey,
  );
  return { proof, publicSignals };
};
