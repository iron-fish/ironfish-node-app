/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

export class DecimalUtils {
  /**
   * Decode a string into a bigint and the number of decimal places \
   * e.g. '1' => { value: 1n, decimals: 0 } \
   *      '1.01' => { value: 101n, decimals: -2 } \
   */
  static tryDecode(input: string): { value: bigint; decimals: number } {
    const split = input.split(".");

    if (split.length > 2) {
      throw new Error("too many decimal points");
    }

    if (split.length === 1) {
      return this.normalize({ value: BigInt(split[0]), decimals: 0 });
    }

    const whole = trimFromStart(split[0], "0");
    const fraction = trimFromEnd(split[1], "0");

    return this.normalize({
      value: BigInt(whole + fraction),
      decimals: -fraction.length,
    });
  }

  /**
   * Strips trailing zeroes from the value and moves them to the decimals \
   * e.g. 1000    => 1   * 10 ^ 3 => { value: 1, decimals: 3 } \
   *      4530000 => 453 * 10 ^ 4 => { value: 453, decimals: 4 }
   */
  static normalize(input: { value: bigint; decimals: number }): {
    value: bigint;
    decimals: number;
  } {
    if (input.value === 0n) {
      return { value: 0n, decimals: 0 };
    }
    const { value, decimals } = input;

    let dividedValue = value;
    let numZeros = 0;
    while (dividedValue % 10n === 0n && dividedValue !== 0n) {
      dividedValue /= 10n;
      numZeros++;
    }

    return { value: dividedValue, decimals: decimals + numZeros };
  }
}

function trimFromEnd(input: string, c: string): string {
  return input.replace(new RegExp(`${c}+$`), "");
}

function trimFromStart(input: string, c: string): string {
  return input.replace(new RegExp(`^${c}+`), "");
}
