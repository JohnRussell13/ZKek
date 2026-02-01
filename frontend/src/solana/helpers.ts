import { address } from "@solana/kit";
import {
  getDepositInstructionAsync,
  getWithdrawInstructionAsync,
  ZKEK_PROGRAM_ADDRESS,
} from "./generated";

export const createDepositInstruction = async (
  signer: any,
  newMerkleRootBytes: number[],
  oldMerkleRootBytes: number[],
  leafIndex: number,
  proof: number[],
) => {
  const depositInstruction = await getDepositInstructionAsync({
    signer: signer as any,
    program: address(ZKEK_PROGRAM_ADDRESS),
    newRoot: new Uint8Array(newMerkleRootBytes),
    oldRoot: new Uint8Array(oldMerkleRootBytes),
    leafIndex: leafIndex,
    proof: new Uint8Array(proof),
  });

  console.log("Deposit instruction created:", depositInstruction);
  return depositInstruction;
};

export const createWithdrawInstruction = async (
  signer: any,
  nullifierBytes: number[],
  rootBytes: number[],
  proof: number[],
) => {
  const withdrawInstruction = await getWithdrawInstructionAsync({
    signer: signer as any,
    admin: address("GJvvThk63GRCnua3zK9Hgm45C5NiSHuwonCAA9hfpkP8"),
    nullifier: new Uint8Array(nullifierBytes),
    root: new Uint8Array(rootBytes),
    proof: new Uint8Array(proof),
  });

  console.log("Withdraw instruction created:", withdrawInstruction);
  return withdrawInstruction;
};
