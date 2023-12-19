import { chakra, useColorModeValue } from "@chakra-ui/react";

import { COLORS } from "@/ui/colors";

export function PendingIcon() {
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
      <rect x="8" y="12" width="2" height="2" fill={fill} />
      <rect x="12" y="12" width="2" height="2" fill={fill} />
      <rect x="16" y="12" width="2" height="2" fill={fill} />
    </chakra.svg>
  );
}
