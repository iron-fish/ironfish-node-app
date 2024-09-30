import { Box } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { COLORS } from "@/ui/colors";

const messages = defineMessages({
  syncingNoProgressMessage: {
    defaultMessage: "Account Syncing",
  },
  syncingProgressMessage: {
    defaultMessage: "Account Syncing: {progress}%",
  },
  syncingBalanceMessage: {
    defaultMessage: "Your balance might not be accurate while you're syncing",
  },
});

export function AccountSyncingProgress({
  progress,
}: {
  progress: number | null;
}) {
  const { formatMessage } = useIntl();

  return (
    <Box
      borderRadius="4px"
      bg={COLORS.YELLOW_LIGHT}
      color={COLORS.YELLOW_DARK}
      _dark={{
        bg: COLORS.DARK_MODE.YELLOW_DARK,
        color: COLORS.DARK_MODE.YELLOW_LIGHT,
      }}
      fontSize="sm"
      textAlign="center"
      p={1}
    >
      {`${
        progress === null
          ? formatMessage(messages.syncingNoProgressMessage)
          : formatMessage(messages.syncingProgressMessage, {
              progress: Math.min(
                parseFloat((progress * 100).toFixed(2)),
                99.99,
              ),
            })
      } | ${formatMessage(messages.syncingBalanceMessage)}`}
    </Box>
  );
}
