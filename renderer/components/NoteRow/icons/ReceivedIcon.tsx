import { chakra } from "@chakra-ui/react";

import { COLORS } from "@/ui/colors";

export function ReceivedIcon() {
  return (
    <chakra.svg
      width={26}
      height={26}
      fill="none"
      color={COLORS.GREEN_LIGHT}
      _dark={{
        color: COLORS.DARK_MODE.GREEN_DARK,
      }}
    >
      <circle cx={13} cy={13} r={13} fill="currentColor" />
      <path stroke="#6A991C" strokeWidth={1.5} d="M14.5 17H9v-5.5M9 17l8-8" />
    </chakra.svg>
  );
}
