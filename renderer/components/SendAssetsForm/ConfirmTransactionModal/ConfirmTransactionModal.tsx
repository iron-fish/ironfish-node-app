import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  Heading,
  Text,
  VStack,
  Box,
  Progress,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { defineMessages, useIntl } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";
import { formatOre } from "@/utils/ironUtils";

import { TransactionData, AssetOptionType } from "../transactionSchema";

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
  transactionData: TransactionData | null;
  selectedAsset?: AssetOptionType;
  onCancel: () => void;
};

export function ConfirmTransactionModal({
  isOpen,
  transactionData,
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
    if (!transactionData) {
      throw new Error("No transaction data");
    }
    sendTransaction(transactionData);
  }, [sendTransaction, transactionData]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="600px">
        <ModalBody px={16} pt={16}>
          {isIdle && (
            <>
              <Heading fontSize="2xl" mb={8}>
                {formatMessage(messages.confirmTransactionDetails)}
              </Heading>

              <VStack alignItems="stretch">
                <Box py={4} borderBottom="1.5px dashed #DEDFE2">
                  <Text color={COLORS.GRAY_MEDIUM}>
                    {formatMessage(messages.from)}
                  </Text>
                  <Text fontSize="md">{transactionData?.fromAccount}</Text>
                </Box>

                <Box py={4} borderBottom="1.5px dashed #DEDFE2">
                  <Text color={COLORS.GRAY_MEDIUM}>
                    {formatMessage(messages.to)}
                  </Text>
                  <Text fontSize="md">{transactionData?.toAccount ?? ""}</Text>
                </Box>

                <Box py={4} borderBottom="1.5px dashed #DEDFE2">
                  <Text color={COLORS.GRAY_MEDIUM}>
                    {formatMessage(messages.amount)}
                  </Text>
                  <Text fontSize="md">
                    {formatOre(transactionData?.amount ?? 0)}{" "}
                    {selectedAsset?.assetName ??
                      formatMessage(messages.unknownAsset)}
                  </Text>
                </Box>

                <Box py={4} borderBottom="1.5px dashed #DEDFE2">
                  <Text color={COLORS.GRAY_MEDIUM}>
                    {formatMessage(messages.fee)}
                  </Text>
                  <Text fontSize="md">
                    {formatOre(transactionData?.fee ?? 0)} $IRON
                  </Text>
                </Box>

                <Box py={4} borderBottom="1.5px dashed #DEDFE2">
                  <Text color={COLORS.GRAY_MEDIUM}>
                    {formatMessage(messages.memo)}
                  </Text>
                  <Text fontSize="md">{transactionData?.memo}</Text>
                </Box>
              </VStack>
            </>
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
