import { CopyIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Text,
  Heading,
  Code,
  HStack,
  Divider,
  chakra,
  Grid,
} from "@chakra-ui/react";
import log from "electron-log";
import { Component, ErrorInfo, ReactNode } from "react";
import { defineMessages, useIntl } from "react-intl";
import { useCopyToClipboard } from "usehooks-ts";

import { WithDraggableArea } from "@/layouts/WithDraggableArea";
import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { useIFToast } from "@/ui/Toast/Toast";

import { ResetNodeButton } from "../NodeSettings/NodeSettings";

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
  appUpdateAvailable: {
    defaultMessage:
      "Note: An app update is available. Please restart the app to apply the update, or download the latest version from the <link>Iron Fish website</link>.",
  },
  resetNodeMessage: {
    defaultMessage:
      "If this issue continues to occur, resetting your node may help. Resetting the node will reinitialize your blockchain data, but it will not delete your accounts.",
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
  const { mutate: relaunchApp } = trpcReact.relaunchApp.useMutation();

  const { data: isUpdateAvailable } = trpcReact.isUpdateAvailable.useQuery();

  console.log({ isUpdateAvailable });

  return (
    <WithDraggableArea>
      <Flex h="100%" alignItems="center" justifyContent="center" p={4}>
        <Box maxW="100%" w="800px">
          <Heading as="h1" textAlign="center" mb={4}>
            {formatMessage(messages.errorStateHeading)}
          </Heading>
          <Grid gap={4} mb={6}>
            <Text fontSize="md">
              {formatMessage(messages.errorStateDescription)}
            </Text>

            {!isUpdateAvailable && (
              <Text fontSize="md">
                {formatMessage(messages.appUpdateAvailable, {
                  // Using `unknown` here due to formatMessage expecting a string even though this is an array of strings
                  link: (content: unknown) => {
                    return (
                      <chakra.span
                        as="a"
                        color={COLORS.LINK}
                        href="https://ironfish.network/use/node-app"
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
            )}
          </Grid>

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

          <Divider my={8} />

          <Text fontSize="md" mb={6}>
            {formatMessage(messages.resetNodeMessage)}
          </Text>

          <ResetNodeButton
            buttonProps={{
              variant: "primary",
            }}
            onSuccess={() => {
              relaunchApp();
            }}
          />
        </Box>
      </Flex>
    </WithDraggableArea>
  );
}
