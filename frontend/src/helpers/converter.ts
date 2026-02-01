export interface Proof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol?: string;
  curve?: string;
}

export function toByteArray(decimalStr: string): number[] {
  let num = BigInt(decimalStr);
  const bytes: number[] = [];
  for (let i = 0; i < 32; i++) {
    bytes.unshift(Number(num & 0xffn));
    num >>= 8n;
  }
  return bytes;
}

export function proofToBytes(proof: Proof): number[] {
  return [
    ...toByteArray(proof.pi_a[0]),
    ...toByteArray(proof.pi_a[1]),
    ...toByteArray(proof.pi_b[0][1]),
    ...toByteArray(proof.pi_b[0][0]),
    ...toByteArray(proof.pi_b[1][1]),
    ...toByteArray(proof.pi_b[1][0]),
    ...toByteArray(proof.pi_c[0]),
    ...toByteArray(proof.pi_c[1]),
  ];
}
