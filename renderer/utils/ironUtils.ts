import { parseFixed } from "@ethersproject/bignumber";

import { IRON_DECIMAL_PLACES } from "../../shared/constants";

const ORE_FORMATTER = Intl.NumberFormat(undefined, {
  maximumFractionDigits: IRON_DECIMAL_PLACES,
});

/**
 * Converts a string or number value in Ore to a number in $IRON.
 */
export function parseOre(value: string | number) {
  const parsedValue = typeof value === "string" ? parseFloat(value) : value;
  return parsedValue / 10 ** IRON_DECIMAL_PLACES;
}

/**
 * Converts a number value in $IRON to a value in Ore.
 */
export function parseIron(value: string | number) {
  // Converts scientific notation to fixed decimals
  const asString =
    typeof value === "number" ? value.toFixed(IRON_DECIMAL_PLACES) : value;
  try {
    return parseFixed(asString, IRON_DECIMAL_PLACES).toNumber();
  } catch {
    return 0;
  }
}

/**
 * Converts a string or number value in Ore to a formatted localized string in $IRON.
 */
export function formatOre(value: string | number) {
  return ORE_FORMATTER.format(parseOre(value));
}

export const MIN_IRON_VALUE = parseOre(1);
