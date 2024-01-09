import { CopyIcon } from "@chakra-ui/icons";
import { Box, Flex, Text, Heading, Code, HStack } from "@chakra-ui/react";
import log from "electron-log";
import { Component, ErrorInfo, ReactNode } from "react";
import { defineMessages, useIntl } from "react-intl";
import { useCopyToClipboard } from "usehooks-ts";

import { WithDraggableArea } from "@/layouts/WithDraggableArea";
import { COLORS } from "@/ui/colors";
import { useIFToast } from "@/ui/Toast/Toast";

const messages = defineMessages({
  errorStateHeading: {
    defaultMessage: "Something went wrong",
  },
  errorStateDescription: {
    defaultMessage:
      "Please restart the app and try again. If the issue persists, let us know on Discord so we can help troubleshoot.",
  },
  errorMessage: {
    defaultMessage: "Error Message",
  },
  errorCopied: {
    defaultMessage: "Error copied to clipboard",
  },
});

type Props = {
  fallback?: ReactNode;
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    log.error(error, info.componentStack);
  }

  render() {
    const { children, fallback } = this.props;
    const { error } = this.state;

    if (error !== null) {
      return fallback ?? <DefaultFallback error={error} />;
    }

    return children;
  }
}

function DefaultFallback({ error }: { error: Error }) {
  const { formatMessage } = useIntl();
  const [_, copyToClipboard] = useCopyToClipboard();
  const toast = useIFToast();
  return (
    <WithDraggableArea>
      <Flex h="100%" alignItems="center" justifyContent="center" p={4}>
        <Box maxW="100%" w="800px">
          <Heading as="h1" textAlign="center" mb={4}>
            {formatMessage(messages.errorStateHeading)}
          </Heading>
          <Text textAlign="center" fontSize="md" mb={6}>
            {formatMessage(messages.errorStateDescription)}
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
          >
            <Text as="pre">{error.message}</Text>
          </Code>
        </Box>
      </Flex>
    </WithDraggableArea>
  );
}
