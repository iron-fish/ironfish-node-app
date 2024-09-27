import { progressAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

import { COLORS } from "@/ui/colors";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(progressAnatomy.keys);

const baseStyle = definePartsStyle({
  track: {
    borderRadius: "full",
  },
});

// This creates a solid progress bar with a lightBlue color which is set as the default
const variants = {
  solid: definePartsStyle((props) => ({
    filledTrack: {
      bg:
        props.colorScheme === "lightBlue"
          ? COLORS.LIGHT_BLUE
          : `${props.colorScheme}.500`,
    },
  })),
};

export const progressTheme = defineMultiStyleConfig({
  baseStyle,
  variants,
  defaultProps: {
    variant: "solid",
    colorScheme: "lightBlue",
  },
});
