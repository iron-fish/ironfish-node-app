import { CopyIcon } from "@chakra-ui/icons";
import { chakra, Box, Code, Heading, HStack, Text } from "@chakra-ui/react";
import { ReactNode } from "react";
import { defineMessages, useIntl } from "react-intl";
import { useCopyToClipboard } from "usehooks-ts";

import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";
import { useIFToast } from "@/ui/Toast/Toast";

import { ErrorBoundary } from "./ErrorBoundary";

const messages = defineMessages({
  errorStateHeading: {
    defaultMessage: "An error occurred",
  },
  errorMessage: {
    defaultMessage: "Error Message",
  },
  errorCopied: {
    defaultMessage: "Error copied to clipboard",
  },
  errorMessageDescription: {
    defaultMessage:
      "Something went wrong while rendering this component. Please try again. If the issue persists, report the issue on <link>Discord</link>.",
  },
  retry: {
    defaultMessage: "Try Again",
  },
});

export function RetryBoundary({ children }: { children: ReactNode }) {
  const { formatMessage } = useIntl();
  const [_, copyToClipboard] = useCopyToClipboard();
  const toast = useIFToast();
  return (
    <ErrorBoundary
      fallback={({ error, clearError }) => (
        <Box
          border="1px solid"
          p={8}
          borderRadius={8}
          borderColor={COLORS.GRAY_MEDIUM}
          _dark={{ borderColor: COLORS.DARK_MODE.GRAY_LIGHT }}
        >
          <Heading as="h1" mb={4}>
            {formatMessage(messages.errorStateHeading)}
          </Heading>

          <Text mb={4}>
            {formatMessage(messages.errorMessageDescription, {
              link: (content: unknown) => {
                return (
                  <chakra.span
                    as="a"
                    color={COLORS.LINK}
                    href="https://discord.ironfish.network/"
                    target="_blank"
                    rel="noreferrer"
                    _hover={{ textDecoration: "underline" }}
                  >
                    {Array.isArray(content) && content.at(0)}
                  </chakra.span>
                );
              },
            })}
          </Text>

          <HStack>
            <Text
              as="button"
              fontWeight="bold"
              mb={2}
              onClick={() => {
                copyToClipboard(error.message);
                toast({
                  message: formatMessage(messages.errorCopied),
                });
              }}
            >
              {formatMessage(messages.errorMessage)}
              <CopyIcon
                color={COLORS.GRAY_MEDIUM}
                _dark={{ color: COLORS.DARK_MODE.GRAY_LIGHT }}
                ml={1}
                transform="translateY(-1px)"
              />
            </Text>
          </HStack>

          <Code
            colorScheme="red"
            p={4}
            maxH="400px"
            maxW="100%"
            w="100%"
            overflow="auto"
            mb={6}
          >
            <Text as="pre">{error.message}</Text>
          </Code>

          <PillButton onClick={clearError}>
            {formatMessage(messages.retry)}
          </PillButton>
        </Box>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
