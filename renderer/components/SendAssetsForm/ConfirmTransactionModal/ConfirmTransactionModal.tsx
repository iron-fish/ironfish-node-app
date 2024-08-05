import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Heading,
  Box,
  Progress,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { defineMessages, useIntl } from "react-intl";

import { AssetOptionType } from "@/components/AssetAmountInput/utils";
import { trpcReact, TRPCRouterOutputs } from "@/providers/TRPCProvider";

import { ReviewTransaction } from "../SharedConfirmSteps/ReviewTransaction";
import { SubmissionError } from "../SharedConfirmSteps/SubmissionError";
import { TransactionSubmitted } from "../SharedConfirmSteps/TransactionSubmitted";
import { TransactionData } from "../transactionSchema";

const messages = defineMessages({
  submittingTransaction: {
    defaultMessage: "Submitting Transaction",
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
          <ModalBody px={16} pt={16}>
            <Heading fontSize="2xl" mb={8}>
              {formatMessage(messages.submittingTransaction)}
            </Heading>
            <Box py={8}>
              <Progress size="sm" isIndeterminate />
            </Box>
          </ModalBody>
        )}
        {isSuccess && (
          <TransactionSubmitted
            fromAccount={selectedAccount.name}
            transactionHash={sentTransactionData?.hash ?? ""}
            handleClose={handleClose}
          />
        )}
        {isError && (
          <SubmissionError
            errorMessage={error?.message ?? "Unknown error"}
            isLoading={isLoading}
            handleClose={handleClose}
            handleSubmit={handleSubmit}
          />
        )}
      </ModalContent>
    </Modal>
  );
}
