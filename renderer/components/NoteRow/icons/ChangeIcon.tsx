import { chakra, useColorModeValue } from "@chakra-ui/react";

import { COLORS } from "@/ui/colors";

export function ChangeIcon() {
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
      <path stroke={fill} strokeWidth={1.5} d="M14.5 17H9v-5.5M9 17l8-8" />
    </chakra.svg>
  );
}
