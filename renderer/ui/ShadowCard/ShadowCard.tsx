import { Box, BoxProps } from "@chakra-ui/react";

import { COLORS } from "../colors";

const SPACING = "4px";

const SHARED_PROPS = {
  border: "1px solid black",
  borderRadius: SPACING,
};

const GRADIENTS = {
  pink: "linear-gradient(to right, #F4BFFF 0%, #DE83F0 100%)",
  green: "linear-gradient(to right, #E1FFB0 0%, #C7F182 100%)",
  blue: "linear-gradient(to right, #BFF6FF 0%, #8AE1EF 100%)",
};

export const gradientOptions = Object.keys(GRADIENTS) as Array<
  keyof typeof GRADIENTS
>;

export type GradientOptions = (typeof gradientOptions)[number];

type Props = BoxProps & {
  contentContainerProps?: BoxProps;
  gradient?: keyof typeof GRADIENTS;
};

export function ShadowCard({
  children,
  contentContainerProps,
  gradient,
  ...rest
}: Props) {
  return (
    <Box
      pr={SPACING}
      pb={SPACING}
      position="relative"
      display="flex"
      alignItems="stretch"
      {...rest}
    >
      <Box
        position="relative"
        bg={gradient ? GRADIENTS[gradient] : "white"}
        p={3}
        zIndex={1}
        w="100%"
        _dark={{
          bg: gradient ? GRADIENTS[gradient] : COLORS.DARK_MODE.GRAY_DARK,
        }}
        {...contentContainerProps}
        {...SHARED_PROPS}
      >
        {children}
      </Box>
      <Box
        position="absolute"
        bg={gradient ? GRADIENTS[gradient] : "white"}
        top={SPACING}
        left={SPACING}
        bottom={0}
        right={0}
        _dark={{
          bg: gradient ? GRADIENTS[gradient] : COLORS.DARK_MODE.GRAY_DARK,
        }}
        {...SHARED_PROPS}
      />
    </Box>
  );
}
