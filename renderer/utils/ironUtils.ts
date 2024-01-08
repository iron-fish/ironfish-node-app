import Big from "big.js";

import { ASSET_DECIMALS } from "../../shared/constants";

const ORE_FORMATTER = Intl.NumberFormat(undefined, {
  maximumFractionDigits: ASSET_DECIMALS,
});

/**
 * Converts a string or number value in Ore to a number in $IRON.
 */
export function parseOre(value: string | number) {
  const parsedValue = typeof value === "string" ? parseFloat(value) : value;
  return parsedValue / 10 ** ASSET_DECIMALS;
}

/**
 * Converts a number value in $IRON to a value in Ore.
 */
export function parseIron(value: string | number) {
  const asBig = new Big(value);
  return asBig
    .times(10 ** ASSET_DECIMALS)
    .round()
    .toNumber();
}

/**
 * Converts a string or number value in Ore to a formatted localized string in $IRON.
 */
export function formatOre(value: string | number) {
  console.log({ value });
  return ORE_FORMATTER.format(parseOre(value));
}

export const MIN_IRON_VALUE = parseOre(1);
