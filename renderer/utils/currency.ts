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
   * Renders a value in a minor denomination as the major denomination:
   * - $IRON is always going to have 8 decimal places.
   * - If a custom asset, and `decimals` is provided, it will give the value
   * followed by a digit for each decimal place
   * - If a custom asset, and `decimals` is not provided, it will assume the
   * value is already in minor denomination with no decimal places
   *
   * Examples:
   * 100000000 = 1 $IRON
   * A custom asset with 2 decimal places: 100 = 1
   * A custom asset with no decimal places: 1 = 1
   */
  static minorToMajor(
    amount: bigint,
    assetId?: string,
    verifiedAssetMetadata?: {
      decimals?: number;
    },
  ): { value: bigint; decimals: number } {
    const { decimals } = this.assetMetadataWithDefaults(
      assetId,
      verifiedAssetMetadata,
    );

    return DecimalUtils.normalize({ value: amount, decimals: -decimals });
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
