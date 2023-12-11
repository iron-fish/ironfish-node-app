import { modalAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

import { COLORS } from "@/ui/colors";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(modalAnatomy.keys);

const baseStyle = definePartsStyle({
  dialog: {
    borderWidth: "1px",
    _dark: {
      bg: COLORS.DARK_MODE.BG,
      borderColor: COLORS.DARK_MODE.GRAY_MEDIUM,
    },
  },
});

export const modalTheme = defineMultiStyleConfig({
  baseStyle,
});
