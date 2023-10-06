import { ASSET_DECIMALS } from "./constants";

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
export function parseIron(value: number) {
  return Math.floor(value * 10 ** ASSET_DECIMALS);
}
