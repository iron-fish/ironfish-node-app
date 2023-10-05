import { extendTheme } from "@chakra-ui/react";

import { breakpoints, createBreakpointArray } from "./breakpoints";

const theme = extendTheme({
  breakpoints,
  fonts: {
    heading: "extended-regular, sans-serif",
    body: "favorit-regular, sans-serif",
  },
});

export { createBreakpointArray };

export default theme;
