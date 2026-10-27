import { Box, Text } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";

const messages = defineMessages({
  unsupportedMacOS: {
    defaultMessage:
      "Your version of macOS is no longer supported. This is the last version of the Iron Fish Node App that will run on it. Upgrade to macOS 13 or later to keep receiving updates.",
  },
});

export function UnsupportedOSBanner() {
  const { data: isUnsupportedMacOS } = trpcReact.isUnsupportedMacOS.useQuery();
  const { formatMessage } = useIntl();

  if (!isUnsupportedMacOS) {
    return null;
  }

  return (
    <Box
      bg={COLORS.RED}
      _dark={{ bg: COLORS.DARK_MODE.RED }}
      textAlign="center"
      py={2}
      px={4}
    >
      <Text color={COLORS.WHITE}>
        {formatMessage(messages.unsupportedMacOS)}
      </Text>
    </Box>
  );
}
