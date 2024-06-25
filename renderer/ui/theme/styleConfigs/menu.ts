import { menuAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers, defineStyle } from "@chakra-ui/react";

import { COLORS } from "@/ui/colors";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(menuAnatomy.keys);

const baseStyle = definePartsStyle({
  // button: {
  //   fontWeight: "medium",
  //   bg: "teal.500",
  //   color: "gray.200",
  //   _hover: {
  //     bg: "teal.600",
  //     color: "white",
  //   },
  // },
  list: {
    py: 4,
    borderRadius: 4,
    border: "1px solid",
    bg: COLORS.WHITE,

    _dark: {
      bg: COLORS.DARK_MODE.BG,
      borderColor: COLORS.DARK_MODE.GRAY_MEDIUM,
    },
  },
  // item: {
  //   color: "gray.200",
  //   _hover: {
  //     bg: "teal.600",
  //   },
  //   _focus: {
  //     bg: "teal.600",
  //   },
  // },
  // groupTitle: {
  //   textTransform: "uppercase",
  //   color: "white",
  //   textAlign: "center",
  //   letterSpacing: "wider",
  //   opacity: "0.7",
  // },
  // command: {
  //   opacity: "0.8",
  //   fontFamily: "mono",
  //   fontSize: "sm",
  //   letterSpacing: "tighter",
  //   pl: "4",
  // },
  // divider: {
  //   my: "4",
  //   borderColor: "white",
  //   borderBottom: "2px dotted",
  // },
});

export const menuTheme = defineMultiStyleConfig({ baseStyle });
