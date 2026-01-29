function toByteArray(decimalStr) {
  let num = BigInt(decimalStr);
  const bytes = [];
  for (let i = 0; i < 32; i++) {
    bytes.unshift(Number(num & 0xffn));
    num >>= 8n;
  }
  return bytes;
}

const result = toByteArray(
  "9904028930859697121695025471312564917337032846528014134060777877259199866166",
);
console.log(result);
