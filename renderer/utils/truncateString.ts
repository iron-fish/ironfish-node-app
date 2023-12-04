export function truncateString(str: string, parts: 2 | 3 = 3) {
  const arr = [str.slice(0, 4), str.slice(-4)];

  if (parts === 3) {
    const halfLength = str.length / 2;
    arr.splice(1, 0, str.slice(halfLength - 2, halfLength + 2));
  }

  return arr.join("...");
}
