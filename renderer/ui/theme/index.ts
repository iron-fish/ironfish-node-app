import { defineStyleConfig, extendTheme } from "@chakra-ui/react";

import { breakpoints, createBreakpointArray } from "./breakpoints";
import { inputTheme } from "./styleConfigs/input";
import { modalTheme } from "./styleConfigs/modal";
import { COLORS } from "../colors";

// To extend the theme, look through baseTheme from chakra-ui/react,
// as well as the docs here: https://chakra-ui.com/docs/components/input/theming

const theme = extendTheme({
  config: {
    initialColorMode: "system",
    useSystemColorMode: true,
  },
  colors: {
    muted: {
      500: "black",
      _dark: {
        500: "white",
      },
    },
  },
  breakpoints,
  fonts: {
    heading: "extended-regular, sans-serif",
    body: "favorit-regular, sans-serif",
  },
  components: {
    Heading: defineStyleConfig({
      baseStyle: {
        fontWeight: "regular",
      },
    }),
    Input: inputTheme,
    Modal: modalTheme,
    Text: defineStyleConfig({
      baseStyle: {
        color: COLORS.BLACK,
        fontSize: "sm",
        _dark: {
          color: COLORS.WHITE,
        },
      },
    }),
    Tabs: defineStyleConfig({
      defaultProps: {
        colorScheme: "muted",
        size: "sm",
      },
    }),
  },
  semanticTokens: {
    colors: {
      ["chakra-placeholder-color"]: {
        _dark: COLORS.DARK_MODE.GRAY_LIGHT,
        _light: COLORS.GRAY_MEDIUM,
      },
      ["chakra-border-color"]: {
        _dark: COLORS.DARK_MODE.GRAY_MEDIUM,
        _light: COLORS.BLACK,
      },
    },
  },
});

export { createBreakpointArray };

export default theme;
