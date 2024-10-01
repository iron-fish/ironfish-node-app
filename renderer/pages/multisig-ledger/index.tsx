import { Heading, Flex, Box } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { SendMultisigLedgerAssetsFlow } from "@/components/SendMultisigLedgerAssetsFlow/SigningFlow";
import MainLayout from "@/layouts/MainLayout";

const messages = defineMessages({
  heading: {
    defaultMessage: "Send",
  },
  aboutFees: {
    defaultMessage: "About Fees",
  },
  feeAmount: {
    defaultMessage:
      "You can change the fee amount you'd like to pay. However, that will directly correlate with the speed with which your transaction is picked up by the blockchain.",
  },
});

export default function Send() {
  const { formatMessage } = useIntl();

  return (
    <MainLayout>
      <Heading fontSize={28} lineHeight="160%" mb={5}>
        {formatMessage(messages.heading)}
      </Heading>
      <Flex gap={16}>
        <Box maxW="592px" w="100%">
          <SendMultisigLedgerAssetsFlow />
        </Box>
      </Flex>
    </MainLayout>
  );
}
