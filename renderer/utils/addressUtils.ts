export function formatAddress(address: string) {
  const halfLength = address.length / 2;

  return [
    address.slice(0, 4),
    address.slice(halfLength - 2, halfLength + 2),
    address.slice(-4),
  ].join("...");
}

// @todo: Verify that this is a valid way of checking if an address is valid
export function isValidPublicAddress(address: string) {
  if (address.length !== 64) return false;

  // Returns true if string only contains digits or letters a-f (case-insensitive)
  return /^[a-f\d]+$/i.test(address);
}
