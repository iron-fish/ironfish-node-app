import { Box, VStack, Text, HStack, StackProps } from "@chakra-ui/react";
import { ReactNode } from "react";

import { COLORS } from "@/ui/colors";

export type FormFieldProps = {
  label: string;
  error?: string;
  icon?: ReactNode;
  triggerProps?: StackProps & { ref: unknown };
};

export function FormField({
  children,
  error,
  label,
  icon,
  triggerProps,
}: FormFieldProps & {
  children: ReactNode;
}) {
  return (
    <VStack>
      <HStack
        as="label"
        w="100%"
        border="1px solid"
        borderColor={error ? COLORS.RED : COLORS.BLACK}
        borderRadius={4}
        _dark={{
          borderColor: error ? COLORS.RED : COLORS.WHITE,
        }}
        {...triggerProps}
      >
        <Box flexGrow={1} w="100%" px={6} py={3}>
          <Text fontSize="sm" color={COLORS.GRAY_MEDIUM}>
            {label}
          </Text>
          {children}
        </Box>
        {icon && <Box pr={4}>{icon}</Box>}
      </HStack>
      {error && (
        <Text color={COLORS.RED} fontSize="sm" textAlign="left" w="100%">
          {error}
        </Text>
      )}
    </VStack>
  );
}
