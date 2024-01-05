import { Box, BoxProps } from "@chakra-ui/react";

import { COLORS } from "../colors";

type PillButtonProps = {
  variant?: "primary" | "inverted";
  icon?: React.ReactNode;
  isDisabled?: boolean;
  type?: "button" | "submit";
  size?: "sm" | "md";
};

type Props = Omit<BoxProps, keyof PillButtonProps> & PillButtonProps;

const VARIANT_PROPS = {
  primary: {
    light: {
      bg: "black",
      color: "white",
      borderColor: "black",
      _hover: {
        bg: "rgba(0, 0, 0, 0.8)",
        borderColor: "rgba(0, 0, 0, 0.8)",
      },
    },
    dark: {
      bg: "white",
      color: "black",
      borderColor: "white",
      _hover: {
        bg: "rgba(255, 255, 255, 0.9)",
        borderColor: "rgba(255, 255, 255, 0.9)",
      },
    },
  },
  inverted: {
    light: {
      bg: "white",
      color: "black",
      borderColor: "black",
      borderRightWidth: "3px",
      borderBottomWidth: "3px",
      _hover: {
        bg: "rgba(0, 0, 0, 0.05)",
      },
    },
    dark: {
      bg: COLORS.DARK_MODE.BG,
      color: "white",
      borderColor: COLORS.DARK_MODE.GRAY_MEDIUM,
      borderRightWidth: "3px",
      borderBottomWidth: "3px",
      _hover: {
        bg: "rgba(255, 255, 255, 0.1)",
        borderColor: COLORS.WHITE,
      },
    },
  },
};

const SIZE_PROPS = {
  sm: {
    py: "6px",
    px: 4,
  },
  md: {
    height: "60px",
    px: 8,
  },
};

export function PillButton({
  variant = "primary",
  children,
  isDisabled,
  type = "button",
  size = "md",
  ...props
}: Props) {
  return (
    <Box
      as="button"
      py="6px"
      borderRadius="full"
      border="1px solid transparent"
      display="flex"
      justifyContent="center"
      alignItems="center"
      gap={2}
      disabled={isDisabled}
      type={type}
      cursor="pointer"
      {...VARIANT_PROPS[variant].light}
      _dark={VARIANT_PROPS[variant].dark}
      _disabled={{
        opacity: 0.6,
        pointerEvents: "none",
      }}
      {...SIZE_PROPS[size]}
      {...props}
    >
      {children}
    </Box>
  );
}
