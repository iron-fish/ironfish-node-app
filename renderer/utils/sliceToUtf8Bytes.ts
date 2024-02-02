/**
 * Slices a string to a given number of bytes (calling .slice on a string would otherwise limit the number of characters)
 */
export function sliceToUtf8Bytes(input: string, bytes: number) {
  new TextEncoder();
  let sliced = input.slice(0, bytes);

  const encoder = new TextEncoder();

  while (encoder.encode(sliced).byteLength > bytes) {
    sliced = sliced.slice(0, sliced.length - 1);
  }

  return sliced;
}
