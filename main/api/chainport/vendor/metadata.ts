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

  public static convertHexToBinary(encodedHex: string): string {
    const buffer = Buffer.from(encodedHex, "hex");
    let binaryString = "";
    for (let i = 0; i < buffer.length; i++) {
      binaryString += buffer[i].toString(2).padStart(8, "0");
    }
    return binaryString;
  }

  /**
   * Decode the encoded hex string into a network id, address, and toIronfish flag
   * @param encodedHex - The encoded hex string
   * @returns A tuple containing the network id, address, and toIronfish flag
   */
  public static decodeV1(encodedHex: string): [number, string, boolean] {
    const hexInteger = BigInt("0x" + encodedHex);
    const encodedString = hexInteger.toString(2);
    const padded = encodedString.padStart(250, "0");
    const networkId = this.decodeNumberFrom10Bits(padded);

    const toIronfish = padded[0] === "1";
    const addressCharacters = [];

    for (let i = 10; i < padded.length; i += 6) {
      const j = i + 6;
      const charBits = padded.slice(i, j);
      addressCharacters.push(this.decodeCharFrom6Bits(charBits));
    }

    const address = "0x" + addressCharacters.join("");

    return [networkId, address.toLowerCase(), toIronfish];
  }

  public static decodeV2(encodedHex: string): [number, string, boolean] {
    const bits = this.convertHexToBinary(encodedHex);
    const toIronfish = bits[6] === "1";
    const memoHexVersion = bits.slice(8, 10);
    if (memoHexVersion !== "01") {
      throw new Error(`Unexpected memoHex version: ${memoHexVersion}`);
    }

    const networkIdBits = bits.slice(10, 16);
    const networkId = parseInt(networkIdBits, 2);
    const addressBits = bits.slice(16, 176);
    let address = "0x";
    for (let i = 0; i < addressBits.length; i += 4) {
      address += parseInt(addressBits.slice(i, i + 4), 2).toString(16);
    }

    return [networkId, address.toLowerCase(), toIronfish];
  }

  public static decode(encodedHex: string): [number, string, boolean] {
    const bits = this.convertHexToBinary(encodedHex);
    const memoHexVersion = bits.slice(8, 10);
    if (memoHexVersion === "01") {
      return this.decodeV2(encodedHex);
    }
    return this.decodeV1(encodedHex);
  }
}
