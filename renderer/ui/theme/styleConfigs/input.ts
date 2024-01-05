import { inputAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

import { COLORS } from "@/ui/colors";

const {
  definePartsStyle: defineInputPartsStyle,
  defineMultiStyleConfig: defineInputMultiStyleConfig,
} = createMultiStyleConfigHelpers(inputAnatomy.keys);

export const inputTheme = defineInputMultiStyleConfig({
  variants: {
    outline: defineInputPartsStyle({
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
