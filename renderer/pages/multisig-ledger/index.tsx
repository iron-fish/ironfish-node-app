import { Heading } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { SendMultisigLedgerAssetsFlow } from "@/components/SendMultisigLedgerAssetsFlow/SigningFlow";
import MainLayout from "@/layouts/MainLayout";

const messages = defineMessages({
  multisigSendHeading: {
    defaultMessage: "Send Multisig Ledger Transaction",
  },
});

export default function Send() {
  const { formatMessage } = useIntl();

  return (
    <MainLayout>
      <Heading fontSize={28} lineHeight="160%" mb={5}>
        {formatMessage(messages.multisigSendHeading)}
      </Heading>
      <SendMultisigLedgerAssetsFlow />
    </MainLayout>
  );
}
