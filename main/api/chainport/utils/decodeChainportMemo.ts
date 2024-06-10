function decodeNumberFrom10Bits(bits: string) {
  return parseInt("0" + bits.slice(1, 10), 2);
}

function decodeCharFrom6Bits(bits: string) {
  const num = parseInt(bits, 2);
  if (num < 10) {
    return num.toString();
  }
  return String.fromCharCode(num - 10 + "a".charCodeAt(0));
}

export function decodeChainportMemo(
  encodedHex: string,
): [number, string, boolean] {
  const hexInteger = BigInt("0x" + encodedHex);
  const encodedString = hexInteger.toString(2);
  const padded = encodedString.padStart(250, "0");
  const networkId = decodeNumberFrom10Bits(padded);

  const toIronfish = padded[0] === "1";
  const addressCharacters = [];

  for (let i = 10; i < padded.length; i += 6) {
    const j = i + 6;
    const charBits = padded.slice(i, j);
    addressCharacters.push(decodeCharFrom6Bits(charBits));
  }

  const address = "0x" + addressCharacters.join("");

  return [networkId, address.toLowerCase(), toIronfish];
}
