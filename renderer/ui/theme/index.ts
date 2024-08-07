import { defineStyleConfig, extendTheme } from "@chakra-ui/react";
import { StyleFunctionProps, mode } from "@chakra-ui/theme-tools";

import { breakpoints, createBreakpointArray } from "./breakpoints";
import { checkboxTheme } from "./styleConfigs/checkbox";
import { inputTheme } from "./styleConfigs/input";
import { menuTheme } from "./styleConfigs/menu";
import { modalTheme } from "./styleConfigs/modal";
import { switchTheme } from "./styleConfigs/switch";
import { tabsTheme } from "./styleConfigs/tabs";
import { COLORS } from "../colors";

// To extend the theme, look through baseTheme from chakra-ui/react,
// as well as the docs here: https://chakra-ui.com/docs/components/input/theming

const theme = extendTheme({
  config: {
    initialColorMode: "system",
    useSystemColorMode: true,
  },
  colors: {
    muted: COLORS.GRAY_MEDIUM,
    _dark: {
      muted: COLORS.DARK_MODE.GRAY_LIGHT,
    },
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: mode("white", COLORS.DARK_MODE.BG)(props),
        color: mode(COLORS.BLACK, COLORS.WHITE)(props),
      },
    }),
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
    Tabs: tabsTheme,
    Progress: {
      baseStyle: {
        track: {
          borderRadius: "full",
        },
      },
    },
    Switch: switchTheme,
    Menu: menuTheme,
    Checkbox: checkboxTheme,
  },
  semanticTokens: {
    colors: {
      ["chakra-body-text"]: {
        _dark: COLORS.WHITE,
        _light: COLORS.BLACK,
      },
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
