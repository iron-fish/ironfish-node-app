import keccak from "keccak";

type Address = `0x${string}`;

/**
 * Calculates the checksum address for a given Ethereum address.
 * @param address - The Ethereum address to calculate the checksum for.
 * @returns The checksum address.
 * @throws {Error} If the provided address is not a valid Ethereum address or if the checksum address does not match the original address.
 */
export function getChecksumAddress(address: string): Address {
  // Ensure the address matches the Ethereum address format
  if (!address.match(/^(?:0x)?[0-9a-fA-F]{40}$/)) {
    throw new Error("Invalid Ethereum address");
  }

  const withPrefix = address.startsWith("0x") ? address : `0x${address}`;
  // Take the address without the prefix and convert it to lowercase for hashing
  const addressHex = withPrefix.substring(2).toLowerCase();
  // Hash the address using keccak256
  const hash = keccak("keccak256").update(addressHex).digest("hex");

  let checksumAddress: Address = "0x";

  // Create checksum address per EIP-55
  /** @see: https://eips.ethereum.org/EIPS/eip-55 */
  for (let i = 0; i < addressHex.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      checksumAddress += addressHex[i].toUpperCase();
    } else {
      checksumAddress += addressHex[i];
    }
  }

  // If the address contains uppercase characters, the checksum address should be equal to the address
  if (/[A-F]/.test(withPrefix) && checksumAddress !== withPrefix) {
    throw new Error("The address provided does not have a valid checksum");
  }

  return checksumAddress;
}

/**
 * Checks if the provided string is a valid Ethereum address.
 * @param address - The string to check.
 * @returns `true` if the string is a valid Ethereum address, `false` otherwise.
 */
export function isAddress(address: string): boolean {
  try {
    getChecksumAddress(address);
    return true;
  } catch {
    return false;
  }
}
