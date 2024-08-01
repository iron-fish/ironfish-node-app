import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  Heading,
  Text,
  Box,
  Progress,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { defineMessages, useIntl } from "react-intl";

import { AssetOptionType } from "@/components/AssetAmountInput/utils";
import { trpcReact, TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";

import { ReviewTransaction } from "../ReviewTransaction/ReviewTransaction";
import { TransactionData } from "../transactionSchema";

const messages = defineMessages({
  confirmTransactionDetails: {
    defaultMessage: "Confirm Transaction Details",
  },
  from: {
    defaultMessage: "From:",
  },
  to: {
    defaultMessage: "To:",
  },
  amount: {
    defaultMessage: "Amount:",
  },
  fee: {
    defaultMessage: "Fee:",
  },
  memo: {
    defaultMessage: "Memo:",
  },
  submittingTransaction: {
    defaultMessage: "Submitting Transaction",
  },
  transactionSubmitted: {
    defaultMessage: "Transaction Submitted",
  },
  transactionSubmittedText: {
    defaultMessage:
      "Your transaction has been submitted. It may take a few minutes until it is confirmed. This transaction will appear in your activity as pending until it is confirmed.",
  },
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
  cancelTransaction: {
    defaultMessage: "Cancel Transaction",
  },
  confirmAndSend: {
    defaultMessage: "Confirm & Send",
  },
  viewAccountActivity: {
    defaultMessage: "View Account Activity",
  },
  viewTransaction: {
    defaultMessage: "View Transaction",
  },
  tryAgain: {
    defaultMessage: "Try Again",
  },
  cancel: {
    defaultMessage: "Cancel",
  },
  unknownAsset: {
    defaultMessage: "unknown asset",
  },
});

type Props = {
  isOpen: boolean;
  transactionData: TransactionData;
  selectedAccount: TRPCRouterOutputs["getAccounts"][number];
  selectedAsset?: AssetOptionType;
  onCancel: () => void;
};

export function ConfirmTransactionModal({
  isOpen,
  transactionData,
  selectedAccount,
  selectedAsset,
  onCancel,
}: Props) {
  const {
    mutate: sendTransaction,
    data: sentTransactionData,
    isIdle,
    isLoading,
    isError,
    isSuccess,
    reset,
    error,
  } = trpcReact.sendTransaction.useMutation();

  const router = useRouter();
  const { formatMessage } = useIntl();

  const handleClose = useCallback(() => {
    reset();
    onCancel();
  }, [onCancel, reset]);

  const handleSubmit = useCallback(() => {
    sendTransaction(transactionData);
  }, [sendTransaction, transactionData]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="600px">
        <ModalBody px={16} pt={16}>
          {isIdle && (
            <ReviewTransaction
              transactionData={transactionData}
              selectedAccount={selectedAccount}
              selectedAsset={selectedAsset}
              isLoading={isLoading}
              onClose={handleClose}
              onSubmit={handleSubmit}
            />
          )}
          {isLoading && (
            <>
              <Heading fontSize="2xl" mb={8}>
                {formatMessage(messages.submittingTransaction)}
              </Heading>
              <Box py={8}>
                <Progress size="sm" isIndeterminate />
              </Box>
            </>
          )}
          {isSuccess && (
            <>
              <Heading fontSize="2xl" mb={8}>
                {formatMessage(messages.transactionSubmitted)}
              </Heading>
              <Text fontSize="md">
                {formatMessage(messages.transactionSubmittedText)}
              </Text>
            </>
          )}
          {isError && (
            <>
              <Heading fontSize="2xl" mb={8}>
                {formatMessage(messages.transactionError)}
              </Heading>
              <Text fontSize="md">
                {formatMessage(messages.transactionErrorText)}
              </Text>

              <Heading fontSize="lg" mt={8} mb={2}>
                {formatMessage(messages.error)}
              </Heading>
              <code>{error.message}</code>
            </>
          )}
        </ModalBody>

        <ModalFooter display="flex" gap={2} px={16} py={8}>
          {(isIdle || isLoading) && (
            <>
              <PillButton
                size="sm"
                isDisabled={isLoading}
                onClick={handleClose}
                variant="inverted"
                border={0}
              >
                {formatMessage(messages.cancelTransaction)}
              </PillButton>
              <PillButton
                size="sm"
                isDisabled={isLoading}
                onClick={handleSubmit}
              >
                {formatMessage(messages.confirmAndSend)}
              </PillButton>
            </>
          )}
          {isSuccess && (
            <>
              <PillButton
                size="sm"
                onClick={() => {
                  const account = transactionData?.fromAccount;
                  if (!account) {
                    handleClose();
                    return;
                  }
                  router.push(`/accounts/${account}`);
                }}
              >
                {formatMessage(messages.viewAccountActivity)}
              </PillButton>
              <PillButton
                size="sm"
                onClick={() => {
                  const account = transactionData?.fromAccount;
                  const transactionHash = sentTransactionData?.hash;
                  if (!account || !transactionHash) {
                    handleClose();
                    return;
                  }
                  router.push(
                    `/accounts/${account}/transaction/${transactionHash}`,
                  );
                }}
              >
                {formatMessage(messages.viewTransaction)}
              </PillButton>
            </>
          )}
          {isError && (
            <>
              <PillButton
                size="sm"
                isDisabled={isLoading}
                onClick={handleClose}
                variant="inverted"
                border={0}
              >
                {formatMessage(messages.cancel)}
              </PillButton>
              <PillButton
                size="sm"
                isDisabled={isLoading}
                onClick={handleSubmit}
              >
                {formatMessage(messages.tryAgain)}
              </PillButton>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
