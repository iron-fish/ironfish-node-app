/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { DecimalUtils } from "./decimalUtils";
import { hexToUTF16String } from "./hexToUTF16String";
import {
  IRON_SYMBOL,
  IRON_DECIMAL_PLACES,
  IRON_ID,
} from "../../shared/constants";

function isNativeIdentifier(assetId: string): boolean {
  return assetId === IRON_ID;
}

export class CurrencyUtils {
  /**
   * Parses a value in a major denomination as the minor denomination where possible:
   * - $IRON is always going to have 8 decimal places.
   * - If a custom asset, and `decimals` is provided, it will give the value
   * followed by a digit for each decimal place
   * - If a custom asset, and `decimals` is not provided, it will assume the
   * value is already in minor denomination with no decimal places
   *
   * Examples:
   * 1 $IRON = 100000000
   * A custom asset with 2 decimal places: 1 = 100
   * A custom asset with no decimal places: 1 = 1
   */
  static tryMajorToMinor(
    amount: bigint | string,
    assetId?: string,
    verifiedAssetMetadata?: {
      decimals?: number;
    },
  ): [bigint, null] | [null, Error] {
    const { decimals } = this.assetMetadataWithDefaults(
      assetId,
      verifiedAssetMetadata,
    );

    try {
      const major = DecimalUtils.tryDecode(amount.toString());
      const minor = { value: major.value, decimals: major.decimals + decimals };

      if (minor.decimals < 0) {
        return [
          null,
          Error("amount is too small to fit into the minor denomination"),
        ];
      }

      const minorValue = minor.value * 10n ** BigInt(minor.decimals);
      return [minorValue, null];
    } catch (e) {
      if (e instanceof Error) {
        return [null, e];
      }
      throw e;
    }
  }

  /**
   * Renders values for human-readable purposes:
   * - Renders $IRON in the major denomination, with 8 decimal places
   * - If a custom asset, and `decimals` is provided, it will render the custom
   *     asset in the major denomination with the decimal places
   * - If a custom asset, and `decimals` is not provided, it will render the
   *     custom asset in the minor denomination with no decimal places
   */
  static render(
    amount: bigint | string,
    assetId?: string,
    verifiedAssetMetadata?: {
      decimals?: number;
    },
  ): string {
    const { decimals } = this.assetMetadataWithDefaults(
      assetId,
      verifiedAssetMetadata,
    );

    return this.formatCurrency(amount, decimals);
  }

  /**
   * Formats a value in the minor denomination as a human-readable currency value with the
   * specified number of decimal places.
   *
   * Min precision is the minimum number of decimal places to include.
   */
  static formatCurrency(
    value: bigint | number | string,
    decimals: number,
    minPrecision: number = 0,
  ): string {
    const asBigInt = BigInt(value);

    if (asBigInt < 0) {
      return `-${this.formatCurrency(
        asBigInt * BigInt(-1),
        decimals,
        minPrecision,
      )}`;
    }

    const decimalsBigInt = BigInt(10) ** BigInt(decimals);

    const major = asBigInt / decimalsBigInt;
    const remainder = asBigInt % decimalsBigInt;
    const remainderString = remainder
      .toString()
      .padStart(decimals, "0")
      .replace(/0+$/, "")
      .padEnd(minPrecision, "0");

    return remainderString ? `${major}.${remainderString}` : major.toString();
  }

  static shortSymbol(
    assetId: string,
    asset?: {
      verification: {
        symbol?: string;
      };
      name: string;
    },
  ): string {
    if (isNativeIdentifier(assetId)) {
      return IRON_SYMBOL;
    }
    return (
      asset?.verification.symbol ||
      (asset?.name && hexToUTF16String(asset.name)) ||
      "Unknown"
    );
  }

  static assetMetadataWithDefaults(
    assetId?: string,
    verifiedAssetMetadata?: {
      decimals?: number;
      symbol?: string;
    },
  ): {
    decimals: number;
    symbol: string;
  } {
    let decimals: number;
    let symbol: string;
    // If an asset ID was provided, check if it is the native asset. Otherwise,
    // we can only assume that the amount is in the native asset
    const isNativeAsset = !assetId || isNativeIdentifier(assetId);
    if (isNativeAsset) {
      // Hard-code the amount of decimals in the native asset
      decimals = IRON_DECIMAL_PLACES;
      symbol = IRON_SYMBOL;
    } else {
      // Default to displaying 0 decimal places for custom assets
      decimals = verifiedAssetMetadata?.decimals || 0;
      symbol = verifiedAssetMetadata?.symbol || assetId;
    }

    return {
      decimals,
      symbol,
    };
  }
}
