import { Box, BoxProps } from "@chakra-ui/react";

import { COLORS, GRADIENTS } from "../colors";

const SHARED_PROPS = {
  border: "1px solid black",
  borderRadius: "4px",
};

export type GradientOptions = keyof typeof GRADIENTS;

export const gradientOptions = Object.keys(GRADIENTS) as Array<GradientOptions>;

function makeGradient(gradient: GradientOptions, isShadow?: boolean) {
  const { from, to } = GRADIENTS[gradient];
  return `linear-gradient(to right, ${
    isShadow ? "white" : from
  } 0%, ${to} 100%)`;
}

type Props = BoxProps & {
  contentContainerProps?: BoxProps;
  gradient?: GradientOptions;
  hoverable?: boolean;
  cardOffset?: string;
};

const SHADOW_HOVER_STYLES = {
  _hover: {
    "& > [data-is-shadow]": {
      bg: "black",
    },
    _dark: {
      "& > [data-is-shadow]": {
        bg: "white",
      },
    },
  },
};

export function ShadowCard({
  children,
  contentContainerProps,
  gradient,
  hoverable = false,
  cardOffset = "4px",
  ...rest
}: Props) {
  return (
    <Box
      pr={cardOffset}
      pb={cardOffset}
      position="relative"
      display="flex"
      alignItems="stretch"
      sx={hoverable ? SHADOW_HOVER_STYLES : undefined}
      {...rest}
    >
      <Box
        data-is-shadow="true"
        position="absolute"
        bg={gradient ? makeGradient(gradient, true) : "white"}
        top={cardOffset}
        left={cardOffset}
        bottom={0}
        right={0}
        pointerEvents="none"
        _dark={{
          bg: gradient
            ? makeGradient(gradient, true)
            : COLORS.DARK_MODE.GRAY_DARK,
        }}
        {...SHARED_PROPS}
      />
      <Box
        position="relative"
        bg={gradient ? makeGradient(gradient) : "white"}
        p={3}
        w="100%"
        _dark={{
          bg: gradient ? makeGradient(gradient) : COLORS.DARK_MODE.GRAY_DARK,
        }}
        {...SHARED_PROPS}
        {...contentContainerProps}
      >
        {children}
      </Box>
    </Box>
  );
}
