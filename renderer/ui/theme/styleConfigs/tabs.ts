import { tabsAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

import { COLORS } from "@/ui/colors";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tabsAnatomy.keys);

export const tabsTheme = defineMultiStyleConfig({
  variants: {
    line: definePartsStyle({
      tab: {
        fontSize: "xs",
        color: COLORS.GRAY_MEDIUM,
        _dark: {
          color: COLORS.DARK_MODE.GRAY_LIGHT,
        },
        _selected: {
          color: COLORS.BLACK,
          _dark: {
            color: COLORS.WHITE,
          },
        },
      },
      tablist: {
        borderColor: "#DEDFE2",
        mt: 5,
        _dark: {
          borderColor: COLORS.DARK_MODE.GRAY_DARK,
        },
      },
    }),
  },
  sizes: {
    sm: {
      tab: {
        lineHeight: "160%",
        pt: 2,
        pb: "7px",
        px: 0,
        mr: 8,
      },
    },
  },
  defaultProps: {
    colorScheme: "muted",
    size: "sm",
  },
});
