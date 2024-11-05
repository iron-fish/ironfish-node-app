import {
  Modal,
  ModalOverlay,
  ModalCloseButton,
  ModalContent,
  ModalBody,
  Heading,
  Box,
  Progress,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";

import { AssetOptionType } from "@/components/AssetAmountInput/utils";
import { trpcReact, TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { normalizeTransactionData } from "@/utils/transactionUtils";

import { ReviewTransaction } from "../SharedConfirmSteps/ReviewTransaction";
import { SubmissionError } from "../SharedConfirmSteps/SubmissionError";
import { TransactionSubmitted } from "../SharedConfirmSteps/TransactionSubmitted";
import { TransactionFormData } from "../transactionSchema";

const messages = defineMessages({
  submittingTransaction: {
    defaultMessage: "Submitting Transaction",
  },
  transactionError: {
    defaultMessage: "Something went wrong with your transaction, please retry.",
  },
});

type Props = {
  isOpen: boolean;
  selectedAccount: TRPCRouterOutputs["getAccounts"][number];
  estimatedFeesData: TRPCRouterOutputs["getEstimatedFees"];
  selectedAsset: AssetOptionType;
  onCancel: () => void;
};

export function ConfirmTransactionModal({
  isOpen,
  selectedAccount,
  selectedAsset,
  onCancel,
  estimatedFeesData,
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

  const { watch, handleSubmit, setError } =
    useFormContext<TransactionFormData>();
  const transactionFormData = watch();

  const { formatMessage } = useIntl();

  const handleClose = useCallback(() => {
    reset();
    onCancel();
  }, [onCancel, reset]);

  const processForm = useCallback(async () => {
    const { normalizedTransactionData, error } = normalizeTransactionData({
      transactionFormData,
      estimatedFeesData,
      selectedAsset,
    });

    if (error !== null) {
      setError("root.serverError", {
        message: error,
      });
    } else {
      sendTransaction(normalizedTransactionData);
    }
  }, [
    sendTransaction,
    transactionFormData,
    estimatedFeesData,
    selectedAsset,
    setError,
  ]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="600px">
        <ModalCloseButton />
        {isIdle && (
          <ReviewTransaction
            selectedAccount={selectedAccount}
            selectedAsset={selectedAsset}
            isLoading={isLoading}
            onClose={handleClose}
            onSubmit={async () => await handleSubmit(processForm)()}
            estimatedFeesData={estimatedFeesData}
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
            handleSubmit={processForm}
          />
        )}
      </ModalContent>
    </Modal>
  );
}
