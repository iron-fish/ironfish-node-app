import { ModalFooter, ModalBody, Heading, Text } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { PillButton } from "@/ui/PillButton/PillButton";

const messages = defineMessages({
  transactionError: {
    defaultMessage: "Transaction Error",
  },
  transactionErrorText: {
    defaultMessage:
      "Something went wrong. Please review your transaction and try again.",
  },
  error: {
    defaultMessage: "Error",
  },
  tryAgain: {
    defaultMessage: "Try Again",
  },
  cancel: {
    defaultMessage: "Cancel",
  },
});

type Props = {
  errorMessage: string;
  isLoading: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
};

export function SubmissionError({
  errorMessage,
  isLoading,
  handleClose,
  handleSubmit,
}: Props) {
  const { formatMessage } = useIntl();

  return (
    <>
      <ModalBody px={16} pt={16}>
        <Heading fontSize="2xl" mb={8}>
          {formatMessage(messages.transactionError)}
        </Heading>
        <Text fontSize="md">
          {formatMessage(messages.transactionErrorText)}
        </Text>

        <Heading fontSize="lg" mt={8} mb={2}>
          {formatMessage(messages.error)}
        </Heading>
        <code>{errorMessage}</code>
      </ModalBody>
      <ModalFooter display="flex" gap={2} px={16} py={8}>
        <PillButton
          size="sm"
          isDisabled={isLoading}
          onClick={handleClose}
          variant="inverted"
          border={0}
        >
          {formatMessage(messages.cancel)}
        </PillButton>
        <PillButton size="sm" isDisabled={isLoading} onClick={handleSubmit}>
          {formatMessage(messages.tryAgain)}
        </PillButton>
      </ModalFooter>
    </>
  );
}
