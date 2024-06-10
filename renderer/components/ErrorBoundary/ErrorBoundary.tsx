import { CopyIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Text,
  Heading,
  Code,
  HStack,
  chakra,
  Grid,
  ListItem,
  OrderedList,
} from "@chakra-ui/react";
import log from "electron-log";
import { Component, ErrorInfo, ReactNode } from "react";
import { defineMessages, useIntl } from "react-intl";
import { useCopyToClipboard } from "usehooks-ts";

import { WithDraggableArea } from "@/layouts/WithDraggableArea";
import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";
import { useIFToast } from "@/ui/Toast/Toast";

import { ResetNodeButton } from "../NodeSettings/NodeSettings";

const messages = defineMessages({
  errorStateHeading: {
    defaultMessage: "Something went wrong",
  },
  errorMessage: {
    defaultMessage: "Error Message",
  },
  errorCopied: {
    defaultMessage: "Error copied to clipboard",
  },
  troubleshootingSteps: {
    defaultMessage: "Troubleshooting Steps",
  },
  restartApp: {
    defaultMessage: "Try restarting the app",
  },
  updateAvailable: {
    defaultMessage:
      "An app update is available. Wait for it to finish downloading and restart the app, or download the latest version from the <link>Iron Fish website</link>.",
  },
  resetNode: {
    defaultMessage:
      "Reset the node. You'll have to re-scan the blockchain, but your accounts and funds will not be affected.",
  },
  reportIssue: {
    defaultMessage:
      "If none of these steps help, please report the issue on <link>Discord</link>.",
  },
  restartAppButton: {
    defaultMessage: "Restart App",
  },
});

type Props = {
  fallback?:
    | ReactNode
    | ((args: { error: Error; clearError: () => void }) => ReactNode);
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

  clearError = () => {
    this.setState({ error: null });
  };

  render() {
    const { children, fallback } = this.props;
    const { error } = this.state;

    if (error === null) return children;

    if (fallback) {
      return typeof fallback === "function"
        ? fallback({ error, clearError: this.clearError })
        : fallback;
    }

    return <DefaultFallback error={error} />;
  }
}

function DefaultFallback({ error }: { error: Error }) {
  const { formatMessage } = useIntl();
  const [_, copyToClipboard] = useCopyToClipboard();
  const toast = useIFToast();
  const { mutate: relaunchApp } = trpcReact.relaunchApp.useMutation();

  const { data: isUpdateAvailable } = trpcReact.isUpdateAvailable.useQuery();

  return (
    <WithDraggableArea>
      <Flex h="100%" alignItems="center" justifyContent="center" p={4}>
        <Box maxW="100%" w="800px">
          <Heading as="h1" textAlign="center" mb={4}>
            {formatMessage(messages.errorStateHeading)}
          </Heading>

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

          <Grid gap={4} mb={6}>
            <Text fontWeight="bold" fontSize="md">
              {formatMessage(messages.troubleshootingSteps)}
            </Text>
            <OrderedList>
              <ListItem>{formatMessage(messages.restartApp)}</ListItem>
              {isUpdateAvailable && (
                <ListItem>
                  {formatMessage(messages.updateAvailable, {
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
                </ListItem>
              )}
              <ListItem>{formatMessage(messages.resetNode)}</ListItem>
              <ListItem>
                {formatMessage(messages.reportIssue, {
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
              </ListItem>
            </OrderedList>
          </Grid>

          <HStack>
            <ResetNodeButton
              buttonProps={{
                variant: "inverted",
              }}
              onSuccess={() => {
                relaunchApp();
              }}
            />
            <PillButton onClick={() => relaunchApp()}>
              {formatMessage(messages.restartAppButton)}
            </PillButton>
          </HStack>
        </Box>
      </Flex>
    </WithDraggableArea>
  );
}
