import { Box, Heading, LightMode, Text, VStack } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { COLORS } from "@/ui/colors";

const messages = defineMessages({
  encryptionNotSupported: {
    defaultMessage: "Encrypted Wallets Unsupported",
  },
  decryptWalletToUse: {
    defaultMessage:
      "Your Iron Fish wallet is encrypted. Encrypted wallets are not yet supported in the node app. Please decrypt your wallet using the CLI to use the node app.",
  },
});

export default function EncryptionNotSupportedPage() {
  const { formatMessage } = useIntl();

  return (
    <LightMode>
      <VStack m={12}>
        <Heading fontSize={28} lineHeight="160%" flexGrow={1}>
          {formatMessage(messages.encryptionNotSupported)}
        </Heading>
        <Box width={640} m={8}>
          <Text
            fontSize="larger"
            lineHeight="160%"
            color={COLORS.WHITE}
            _dark={{
              color: COLORS.WHITE,
            }}
          >
            {formatMessage(messages.decryptWalletToUse)}
          </Text>
        </Box>
      </VStack>
    </LightMode>
  );
}
