import { Box, BoxProps } from "@chakra-ui/react";

const SPACING = "4px";

const SHARED_PROPS = {
  border: "1px solid black",
  borderRadius: SPACING,
};

const GRADIENTS = {
  pink: "linear-gradient(to right, #F4BFFF 0%, #DE83F0 100%)",
  green: "linear-gradient(to right, #F4BFFF 0%, #DE83F0 100%)",
  blue: "linear-gradient(to right, #F4BFFF 0%, #DE83F0 100%)",
};

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
        {...SHARED_PROPS}
      />
    </Box>
  );
}
