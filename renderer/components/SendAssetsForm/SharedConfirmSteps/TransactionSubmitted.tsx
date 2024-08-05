import { ModalFooter, ModalBody, Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { defineMessages, useIntl } from "react-intl";

import { PillButton } from "@/ui/PillButton/PillButton";

const messages = defineMessages({
  transactionSubmitted: {
    defaultMessage: "Transaction Submitted",
  },
  transactionSubmittedText: {
    defaultMessage:
      "Your transaction has been submitted. It may take a few minutes until it is confirmed. This transaction will appear in your activity as pending until it is confirmed.",
  },

  viewAccountActivity: {
    defaultMessage: "View Account Activity",
  },
  viewTransaction: {
    defaultMessage: "View Transaction",
  },
});

type Props = {
  fromAccount: string;
  transactionHash: string;
  handleClose: () => void;
};

export function TransactionSubmitted({
  fromAccount,
  transactionHash,
  handleClose,
}: Props) {
  const router = useRouter();
  const { formatMessage } = useIntl();
  return (
    <>
      <ModalBody px={16} pt={16}>
        <Heading fontSize="2xl" mb={8}>
          {formatMessage(messages.transactionSubmitted)}
        </Heading>
        <Text fontSize="md">
          {formatMessage(messages.transactionSubmittedText)}
        </Text>
      </ModalBody>
      <ModalFooter display="flex" gap={2} px={16} py={8}>
        <PillButton
          size="sm"
          onClick={() => {
            if (!fromAccount) {
              handleClose();
              return;
            }
            router.push(`/accounts/${fromAccount}`);
          }}
        >
          {formatMessage(messages.viewAccountActivity)}
        </PillButton>
        <PillButton
          size="sm"
          onClick={() => {
            const account = fromAccount;
            if (!account || !transactionHash) {
              handleClose();
              return;
            }
            router.push(`/accounts/${account}/transaction/${transactionHash}`);
          }}
        >
          {formatMessage(messages.viewTransaction)}
        </PillButton>
      </ModalFooter>
    </>
  );
}
