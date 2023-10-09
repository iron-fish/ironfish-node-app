/**
 * Takes a hex string and converts it to a string of ASCII characters.
 */
export function hexToASCIIString(hex: string) {
  const asString = hex.toString();
  let result = "";

  for (let i = 0; i < asString.length; i += 2) {
    const charCode = parseInt(asString.substring(i, i + 2), 16);
    if (charCode) {
      result += String.fromCharCode(charCode);
    }
  }
  return result;
}
