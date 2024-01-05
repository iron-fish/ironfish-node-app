import { Box } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { COLORS } from "@/ui/colors";

const messages = defineMessages({
  syncingProgressMessage: {
    defaultMessage: "Account Syncing: {progress}%",
  },
  syncingBalanceMessage: {
    defaultMessage: "Your balance might not be accurate while you're syncing",
  },
});

export function AccountSyncingProgress({ progress }: { progress: number }) {
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
    >{`${formatMessage(messages.syncingProgressMessage, {
      progress: parseFloat((progress * 100).toFixed(2)),
    })} | ${formatMessage(messages.syncingBalanceMessage)}`}</Box>
  );
}
