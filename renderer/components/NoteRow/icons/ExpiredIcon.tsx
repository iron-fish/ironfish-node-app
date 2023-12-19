import { chakra, useColorModeValue } from "@chakra-ui/react";

import { COLORS } from "@/ui/colors";

export function ExpiredIcon() {
  const fill = useColorModeValue(
    COLORS.GRAY_MEDIUM,
    COLORS.DARK_MODE.GRAY_LIGHT,
  );

  return (
    <chakra.svg
      width={26}
      height={26}
      fill="none"
      color={COLORS.GRAY_LIGHT}
      _dark={{
        color: COLORS.DARK_MODE.GRAY_MEDIUM,
      }}
    >
      <circle cx={13} cy={13} r={13} fill="currentColor" />
      <path d="M18 8L8 18M8 8L18 18" stroke={fill} strokeWidth="1.5" />
    </chakra.svg>
  );
}
