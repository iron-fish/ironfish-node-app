import { Box, ModalFooter, ModalBody, Heading, Text } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { PillButton } from "@/ui/PillButton/PillButton";

const messages = defineMessages({
  heading: {
    defaultMessage: "Transaction Rejected",
  },
  message: {
    defaultMessage:
      "The transaction has been rejected from your Ledger device. Please try again if you'd like to continue.",
  },
  tryAgain: {
    defaultMessage: "Try Again",
  },
  cancel: {
    defaultMessage: "Cancel",
  },
});

type Props = {
  isLoading: boolean;
  handleClose: () => void;
  handleSubmit: () => void;
};

export function TransactionRejected({
  isLoading,
  handleClose,
  handleSubmit,
}: Props) {
  const { formatMessage } = useIntl();

  return (
    <>
      <ModalBody px={16} pt={16}>
        <Heading fontSize="2xl" mb={8}>
          {formatMessage(messages.heading)}
        </Heading>
        <Box
          bg="#FFF5F1"
          display="flex"
          justifyContent="center"
          py={10}
          borderRadius={4}
        >
          <Box
            bg="#FFE5DD"
            height="116px"
            width="116px"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <svg width="8" height="52" viewBox="0 0 8 52" fill="none">
              <path
                d="M0.375 33.25V0.625H7.625V33.25H0.375ZM0.375 51.375V44.125H7.625V51.375H0.375Z"
                fill="#F15929"
              />
            </svg>
          </Box>
        </Box>
        <Text fontSize="md" mt={6} color="muted">
          {formatMessage(messages.message)}
        </Text>
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
