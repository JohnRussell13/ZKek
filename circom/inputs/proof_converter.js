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
    "15366493206709541892245753689390600664683990219964518929293368552650040672357",
    "14054433485107110350413740131921815003227379849695623334462445790387627473824",
    "1",
  ],
  pi_b: [
    [
      "1905241383915761534941415288237946468289803542034073668572062802919510899758",
      "20672329133203487600608356756677719386342387791385549470446040140214323519302",
    ],
    [
      "12180605297479758252905975029410231702120361839552139362617067564184133659305",
      "20756346172161242061394504043862551931326859621197765737873269354037523504468",
    ],
    ["1", "0"],
  ],
  pi_c: [
    "5745973286966954071990714902813246335590341416995019804741810337057817515188",
    "11146547911381905090026482128335362879003899876253096175850734958008887605837",
    "1",
  ],
  protocol: "groth16",
  curve: "bn128",
};

const bytes = proofToBytes(proof);
console.log(bytes.length); // 256
console.log(JSON.stringify(bytes));
