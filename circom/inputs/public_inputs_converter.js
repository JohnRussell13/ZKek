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
  "9245705055480255177583295847442039571008556521693677383953853207394669207769",
);
console.log(result);
