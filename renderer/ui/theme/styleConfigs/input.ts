import { inputAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

import { COLORS } from "@/ui/colors";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(inputAnatomy.keys);

export const inputTheme = defineMultiStyleConfig({
  variants: {
    outline: definePartsStyle({
      field: {
        _hover: {
          borderColor: COLORS.DARK_MODE.GRAY_LIGHT,
        },
        _dark: {
          bg: COLORS.DARK_MODE.GRAY_DARK,
          _hover: {
            borderColor: COLORS.WHITE,
          },
        },
      },
    }),
  },
});
