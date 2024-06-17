import { switchAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

import { COLORS } from "@/ui/colors";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(switchAnatomy.keys);

const baseStyle = definePartsStyle((_props) => ({
  thumb: {
    bg: COLORS.WHITE,
  },
  track: {
    bg: COLORS.GRAY_MEDIUM,

    _checked: {
      bg: "#6A991C",
    },

    _dark: {
      bg: COLORS.DARK_MODE.GRAY_LIGHT,

      _checked: {
        bg: COLORS.PISTACHIO,
      },
    },
  },
}));

const lgTrackPadding = "4px";
const lgThumbSize = "28px";
const lgTrackWidth = "58px";

export const switchTheme = defineMultiStyleConfig({
  baseStyle,
  sizes: {
    lg: {
      thumb: {
        w: lgThumbSize,
        h: lgThumbSize,

        _checked: {
          transform: `translateX(calc(${lgTrackWidth} - ${lgThumbSize}))`,
        },
      },
      track: {
        padding: lgTrackPadding,
        w: lgTrackWidth,
        h: "28px",
      },
    },
  },
  defaultProps: {
    size: "lg",
  },
});
