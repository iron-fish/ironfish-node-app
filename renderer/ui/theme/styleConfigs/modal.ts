import { modalAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

import { COLORS } from "@/ui/colors";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(modalAnatomy.keys);

const baseStyle = definePartsStyle({
  dialog: {
    borderRadius: "4px",
    _dark: {
      bg: COLORS.DARK_MODE.BG,
    },
  },
});

export const modalTheme = defineMultiStyleConfig({
  baseStyle,
});
