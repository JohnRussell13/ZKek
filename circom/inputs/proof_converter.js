function toByteArray(decimalStr) {
  let num = BigInt(decimalStr);
  const bytes = [];
  for (let i = 0; i < 32; i++) {
    bytes.unshift(Number(num & 0xffn));
    num >>= 8n;
  }
  return bytes;
}

function proofToBytes(proof) {
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

// Usage
const proof = {
  pi_a: [
    "21157811560301554080981070893625586585177699442635106732399169717682571880633",
    "17087898847805114964336338139145513705336225614460972403385324028575074708362",
    "1",
  ],
  pi_b: [
    [
      "15531101886387979358133974119634745836972314821783122962824920980900718179877",
      "17210182746304421982286634061275349440013345256954128174569591483806665452832",
    ],
    [
      "15322018010732974158594242860899286073752231806604990604913686024564783256763",
      "10572264967035010532416283662743469343292754171087667742320490686551280047170",
    ],
    ["1", "0"],
  ],
  pi_c: [
    "75286630117884231314722361269773199324072133710526534684910622411156013822",
    "271483995308384277378053084598030795037574157359119787328433786773132238066",
    "1",
  ],
  protocol: "groth16",
  curve: "bn128",
};

const bytes = proofToBytes(proof);
console.log(bytes.length); // 256
console.log(JSON.stringify(bytes));
