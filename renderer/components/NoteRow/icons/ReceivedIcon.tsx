import { chakra, useColorModeValue } from "@chakra-ui/react";

import { COLORS } from "@/ui/colors";

export function ReceivedIcon() {
  const foregroundColor = useColorModeValue(
    COLORS.GREEN_DARK,
    COLORS.DARK_MODE.GREEN_LIGHT,
  );

  return (
    <chakra.svg
      width={26}
      height={26}
      fill="none"
      color={COLORS.GREEN_LIGHT}
      _dark={{
        color: "#2B351D",
      }}
    >
      <circle cx={13} cy={13} r={13} fill="currentColor" />
      <path
        d="M17 11.5L17 17L11.5 17"
        stroke={foregroundColor}
        strokeWidth="1.5"
      />
      <path d="M17 17L9 9" stroke={foregroundColor} strokeWidth="1.5" />
    </chakra.svg>
  );
}
