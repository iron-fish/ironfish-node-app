import { defineStyleConfig, extendTheme } from "@chakra-ui/react";

import { breakpoints, createBreakpointArray } from "./breakpoints";
import { COLORS } from "../colors";

const theme = extendTheme({
  breakpoints,
  fonts: {
    heading: "extended-regular, sans-serif",
    body: "favorit-regular, sans-serif",
  },
  components: {
    Text: defineStyleConfig({
      baseStyle: {
        color: COLORS.BLACK,
        fontSize: "sm",
        _dark: {
          color: COLORS.WHITE,
        },
      },
    }),
  },
});

export { createBreakpointArray };

export default theme;
