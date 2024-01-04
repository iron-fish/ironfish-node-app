import { Box, BoxProps, Text } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { COLORS } from "@/ui/colors";

const messages = defineMessages({
  chainSyncingMessage: {
    defaultMessage:
      "The blockchain is syncing. Your balance may be inaccurate and sending transactions will be disabled until the sync is complete.",
  },
  accountSyncingMessage: {
    defaultMessage:
      "The selected account is syncing. Your balance may be inaccurate and sending transactions will be disabled until the sync is complete.",
  },
});

export function ChainSyncingMessage(props: BoxProps) {
  const { formatMessage } = useIntl();

  return (
    <Box
      w="100%"
      px={6}
      py={4}
      borderRadius={8}
      bg={COLORS.YELLOW_LIGHT}
      _dark={{
        bg: COLORS.DARK_MODE.YELLOW_DARK,
      }}
      {...props}
    >
      <Text
        fontSize="md"
        color={COLORS.YELLOW_DARK}
        _dark={{
          color: COLORS.DARK_MODE.YELLOW_LIGHT,
        }}
      >
        {formatMessage(messages.chainSyncingMessage)}
      </Text>
    </Box>
  );
}

export function AccountSyncingMessage(props: BoxProps) {
  const { formatMessage } = useIntl();

  return (
    <Box
      w="100%"
      px={6}
      py={4}
      borderRadius={8}
      bg={COLORS.YELLOW_LIGHT}
      _dark={{
        bg: COLORS.DARK_MODE.YELLOW_DARK,
      }}
      {...props}
    >
      <Text
        fontSize="md"
        color={COLORS.YELLOW_DARK}
        _dark={{
          color: COLORS.DARK_MODE.YELLOW_LIGHT,
        }}
      >
        {formatMessage(messages.chainSyncingMessage)}
      </Text>
    </Box>
  );
}
