export const COLORS = {
  BLACK: "#0D0C22",
  WHITE: "#FFFFFF",
  GRAY_LIGHT: "#F3F3F4",
  GRAY_MEDIUM: "#7F7F7F",

  VIOLET: "#DE83F0",
  LIGHT_BLUE: "#2C72FF",
  DEEP_BLUE: "#1D0070",
  RED: "#F15929",

  SKY_BLUE: "#D3F9FF",
  DARK_BLUE: "#005664",

  GREEN_LIGHT: "#ECFFCE",
  GREEN_DARK: "#6A991C",
  YELLOW_LIGHT: "#FFF9B8",
  YELLOW_DARK: "#887D09",

  LINK: "#2C72FF",

  DARK_MODE: {
    BG: "#101010",
    GRAY_LIGHT: "#ADAEB4",
    GRAY_MEDIUM: "#3B3B3B",
    GRAY_DARK: "#252525",
    SKY_BLUE: "#D3F9FF",
    DARK_BLUE: "#005664",
    GREEN_LIGHT: "#C7F182",
    GREEN_DARK: "#242C18",
    YELLOW_LIGHT: "#E3DB7C",
    YELLOW_DARK: "#4B4608",
  } as const,
} as const;

export const GRADIENTS = {
  violet: {
    from: "#F4BFFF",
    to: "#DE83F0",
  },
  green: {
    from: "#E1FFB0",
    to: "#C7F182",
  },
  lightBlue: {
    from: "#BFF6FF",
    to: "#8AE1EF",
  },
  orange: {
    from: "#FFE2B9",
    to: "#FFCD85",
  },
  pink: {
    from: "#FFD7F0",
    to: "#FFC2E8",
  },
  yellow: {
    from: "#FFF698",
    to: "#FFEC1F",
  },
  blue: {
    from: "#85ADFD",
    to: "#4B87FF",
  },
  cream: {
    from: "#FFF5EB",
    to: "#FBEADA",
  },
};

const GRADIENTS_ARRAY = Object.values(GRADIENTS);

export function getGradientByOrder(order: number) {
  const gradient = GRADIENTS_ARRAY[order % GRADIENTS_ARRAY.length];
  return `linear-gradient(90deg, ${gradient.from} 0%, ${gradient.to} 100%)`;
}
