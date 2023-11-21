import { Box, BoxProps } from "@chakra-ui/react";

type PillButtonProps = {
  variant?: "primary" | "inverted";
  icon?: React.ReactNode;
  isDisabled?: boolean;
  type?: "button" | "submit";
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
      bg: "black",
      color: "white",
      borderColor: "white",
      borderRightWidth: "3px",
      borderBottomWidth: "3px",
      _hover: {
        bg: "rgba(255, 255, 255, 0.1)",
      },
    },
  },
};

export function PillButton({
  variant = "primary",
  children,
  isDisabled,
  type = "button",
  ...props
}: Props) {
  return (
    <Box
      as="button"
      py="6px"
      px={4}
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
      {...props}
    >
      {children}
    </Box>
  );
}
