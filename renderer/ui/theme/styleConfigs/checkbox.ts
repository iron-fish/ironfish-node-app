import { checkboxAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

import { COLORS } from "@/ui/colors";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(checkboxAnatomy.keys);

const baseStyle = definePartsStyle((_props) => ({
  control: {
    bg: COLORS.WHITE,
  },
}));

const lgControlSize = "29px";

export const checkboxTheme = defineMultiStyleConfig({
  baseStyle,
  sizes: {
    lg: {
      control: {
        w: lgControlSize,
        h: lgControlSize,
        borderColor: COLORS.BLACK,
        borderWidth: "1px",
        borderRadius: "2px",

        _checked: {
          borderColor: COLORS.GREEN_DARK,
          bg: COLORS.GREEN_LIGHT,

          _hover: {
            bg: COLORS.GREEN_LIGHT,
          },
        },

        _disabled: {
          borderColor: COLORS.GRAY_MEDIUM,
          bg: COLORS.GRAY_LIGHT,
        },

        _dark: {
          borderColor: COLORS.WHITE,
          bg: COLORS.DARK_MODE.GRAY_MEDIUM,

          _checked: {
            borderColor: COLORS.DARK_MODE.GREEN_LIGHT,
            bg: COLORS.DARK_MODE.GREEN_DARK,

            _hover: {
              bg: COLORS.DARK_MODE.GREEN_DARK,
            },
          },
        },
      },
      icon: {
        color: COLORS.GREEN_DARK,

        _dark: {
          color: COLORS.DARK_MODE.GREEN_LIGHT,
        },
      },
    },
  },
  defaultProps: {
    size: "lg",
  },
});
