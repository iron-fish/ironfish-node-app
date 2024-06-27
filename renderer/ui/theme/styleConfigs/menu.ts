import { menuAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

import { COLORS } from "@/ui/colors";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(menuAnatomy.keys);

const baseStyle = definePartsStyle({
  list: {
    py: 2,
    borderRadius: 4,
    borderWidth: "1px 2px 2px 1px",
    bg: COLORS.WHITE,

    _dark: {
      bg: COLORS.DARK_MODE.BG,
      borderColor: COLORS.DARK_MODE.GRAY_MEDIUM,
    },
  },
  item: {
    bg: "transparent",
    py: 2,

    _hover: {
      bg: COLORS.GRAY_LIGHT,

      _dark: {
        bg: COLORS.DARK_MODE.GRAY_DARK,
      },
    },
  },
});

export const menuTheme = defineMultiStyleConfig({ baseStyle });
