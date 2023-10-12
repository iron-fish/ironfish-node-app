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
  const parsedValue = typeof value === "string" ? parseFloat(value) : value;
  return Math.floor(parsedValue * 10 ** ASSET_DECIMALS);
}

/**
 * Converts a string or number value in Ore to a formatted localized string in $IRON.
 */
export function formatOre(value: string | number) {
  return ORE_FORMATTER.format(parseOre(value));
}
