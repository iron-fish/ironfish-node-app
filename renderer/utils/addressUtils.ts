export function formatAddress(address: string) {
  const halfLength = address.length / 2;

  return [
    address.slice(0, 4),
    address.slice(halfLength - 2, halfLength + 2),
    address.slice(-4),
  ].join("...");
}
