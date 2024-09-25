import { GRADIENTS } from "@/ui/colors";

export type GradientColors = keyof typeof GRADIENTS;

const gradientColors = Object.keys(GRADIENTS) as Array<GradientColors>;

/**
 * Creates a CSS linear gradient string based on the provided gradient color.
 */
export function makeGradient(gradient: GradientColors, isShadow?: boolean) {
  const { from, to } = GRADIENTS[gradient];
  return `linear-gradient(to right, ${
    isShadow ? "white" : from
  } 0%, ${to} 100%)`;
}

/**
 * Determines a gradient color based on an address.
 */
export function getAddressGradientColor(address: string) {
  const bigAddress = BigInt(`0x${address}`);
  const bigLength = BigInt(gradientColors.length);
  return gradientColors[Number(bigAddress % bigLength)];
}

/**
 * Retrieves the gradient object for a given gradient color.
 */
export function getGradientObject(gradient: GradientColors) {
  return GRADIENTS[gradient];
}
