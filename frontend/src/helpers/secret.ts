export const generateSecretKey = (): string => {
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);

  // Convert bytes to hex then to BigInt then to decimal string
  const hexString = Array.from(randomBytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  const bigIntValue = BigInt("0x" + hexString);

  // Return as decimal string
  return bigIntValue.toString();
};

export const generateSecretKeyBigInt = (): bigint => {
  const decimalKey = generateSecretKey();
  return BigInt(decimalKey);
};
