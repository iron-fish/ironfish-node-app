import { tabsAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

import { COLORS } from "@/ui/colors";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tabsAnatomy.keys);

export const tabsTheme = defineMultiStyleConfig({
  variants: {
    line: definePartsStyle({
      tablist: {
        borderColor: "#DEDFE2",
        _dark: {
          borderColor: COLORS.DARK_MODE.GRAY_DARK,
        },
      },
    }),
  },
  defaultProps: {
    colorScheme: "muted",
    size: "sm",
  },
});
