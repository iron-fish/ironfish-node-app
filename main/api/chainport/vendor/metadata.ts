/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

/**
 * Chainport memo metadata encoding and decoding
 * The metadata is encoded in a 64 character hex string
 * The first bit is a flag to indicate if the transaction is to IronFish or from IronFish
 * The next 10 bits are the network id
 * The rest of the bits are the address
 *
 * Official documentation: https://docs.chainport.io/for-developers/integrate-chainport/iron-fish/utilities/ironfishmetadata
 */
export class ChainportMemoMetadata {
  constructor() {}

  public static convertNumberToBinaryString(num: number, padding: number) {
    return num.toString(2).padStart(padding, "0");
  }

  public static encodeNumberTo10Bits(number: number) {
    return this.convertNumberToBinaryString(number, 10);
  }

  public static decodeNumberFrom10Bits(bits: string) {
    return parseInt("0" + bits.slice(1, 10), 2);
  }

  public static encodeCharacterTo6Bits(character: string) {
    const parsedInt = parseInt(character);
    if (!isNaN(parsedInt)) {
      return this.convertNumberToBinaryString(parsedInt, 6);
    }

    const int = character.charCodeAt(0) - "a".charCodeAt(0) + 10;
    return this.convertNumberToBinaryString(int, 6);
  }

  public static decodeCharFrom6Bits(bits: string) {
    const num = parseInt(bits, 2);
    if (num < 10) {
      return num.toString();
    }
    return String.fromCharCode(num - 10 + "a".charCodeAt(0));
  }

  /**
   * Decode the encoded hex string into a network id, address, and toIronfish flag
   * @param encodedHex - The encoded hex string
   * @returns A tuple containing the network id, address, and toIronfish flag
   */
  public static decode(encodedHex: string): [number, string, boolean] {
    const bytes = Buffer.from(encodedHex, "hex");
    const networkId = bytes.readUInt8(0);
    const addressBytes = bytes.subarray(1, 21);
    const address = "0x" + addressBytes.toString("hex");
    const toIronfish = (bytes[21] & 0x80) !== 0;

    return [networkId, address.toLowerCase(), toIronfish];
  }
}
