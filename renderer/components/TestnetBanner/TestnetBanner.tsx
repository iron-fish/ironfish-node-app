import { Box, Text } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";

const messages = defineMessages({
  testnet: {
    defaultMessage: "You are currently on Testnet!",
  },
});

export function TestnetBanner() {
  const { data } = trpcReact.getNetworkInfo.useQuery();
  const { formatMessage } = useIntl();

  if (data?.networkId === 1) {
    return null;
  }

  return (
    <Box
      bg={COLORS.SKY_BLUE}
      color={COLORS.DARK_BLUE}
      _dark={{
        bg: COLORS.DARK_MODE.DARK_BLUE,
        color: COLORS.DARK_MODE.SKY_BLUE,
      }}
      textAlign="center"
      p={1}
    >
      <Text>{formatMessage(messages.testnet)}</Text>
    </Box>
  );
}
