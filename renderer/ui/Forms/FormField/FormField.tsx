import { Box, VStack, Text, HStack, StackProps } from "@chakra-ui/react";
import { ReactNode, useMemo } from "react";
import { FieldError, FieldErrorsImpl } from "react-hook-form";

import { COLORS } from "@/ui/colors";

export type FormFieldProps = {
  label: string | ReactNode;
  error?: string | FieldError | FieldErrorsImpl;
  icon?: ReactNode;
  triggerProps?: StackProps & { ref: unknown };
  actions?: ReactNode;
};

export function FormField({
  children,
  error,
  label,
  icon,
  triggerProps,
  actions,
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
          <HStack>
            {typeof label === "string" ? (
              <Text fontSize="sm" color={COLORS.GRAY_MEDIUM} flexGrow={1}>
                {label}
              </Text>
            ) : (
              label
            )}

            {actions && (
              <Box onClick={(e) => e.preventDefault()}>{actions}</Box>
            )}
          </HStack>
          {children}
        </Box>
        {icon && <Box pr={4}>{icon}</Box>}
      </HStack>
      <RenderError error={error} />
    </VStack>
  );
}

function RenderError({
  error,
}: {
  error?: string | FieldError | FieldErrorsImpl;
}) {
  const message = useMemo(() => {
    if (typeof error === "string") {
      return error;
    }
    return typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string"
      ? error.message
      : "";
  }, [error]);

  if (!message) {
    return null;
  }

  return (
    <Text color={COLORS.RED} fontSize="sm" textAlign="left" w="100%">
      {message}
    </Text>
  );
}
