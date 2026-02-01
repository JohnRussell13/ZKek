import { buildPoseidon } from "circomlibjs";

export type BigNumberish = string | bigint | number | Uint8Array;

export const hash = async (x: BigNumberish[]) => {
  console.log("USLI U HAS");
  const poseidon = await buildPoseidon();

  const F = poseidon.F;

  console.log("FUNKCIJA: " + F);

  const hashResult = poseidon(x);
  console.log("WTF " + F.toString(hashResult));

  return F.toString(hashResult);
};
