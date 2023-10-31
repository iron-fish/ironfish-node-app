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

import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";
import { formatAddress } from "@/utils/addressUtils";
import { formatOre } from "@/utils/ironUtils";

import { TransactionData } from "../transactionSchema";

type Props = {
  isOpen: boolean;
  transactionData: TransactionData | null;
  selectedAssetName: string;
  onCancel: () => void;
};

export function ConfirmTransactionModal({
  isOpen,
  transactionData,
  selectedAssetName,
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
  } = trpcReact.sendTransaction.useMutation();
  const router = useRouter();

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
                Confirm Transaction Details
              </Heading>

              <VStack alignItems="stretch">
                <Box py={4} borderBottom="1.5px dashed #DEDFE2">
                  <Text color={COLORS.GRAY_MEDIUM}>From:</Text>
                  <Text fontSize="md">{transactionData?.fromAccount}</Text>
                </Box>

                <Box py={4} borderBottom="1.5px dashed #DEDFE2">
                  <Text color={COLORS.GRAY_MEDIUM}>To:</Text>
                  <Text fontSize="md">
                    {formatAddress(transactionData?.toAccount ?? "")}
                  </Text>
                </Box>

                <Box py={4} borderBottom="1.5px dashed #DEDFE2">
                  <Text color={COLORS.GRAY_MEDIUM}>Amount:</Text>
                  <Text fontSize="md">
                    {formatOre(transactionData?.amount ?? 0)}{" "}
                    {selectedAssetName}
                  </Text>
                </Box>

                <Box py={4} borderBottom="1.5px dashed #DEDFE2">
                  <Text color={COLORS.GRAY_MEDIUM}>Fee:</Text>
                  <Text fontSize="md">
                    {formatOre(transactionData?.fee ?? 0)} $IRON
                  </Text>
                </Box>

                <Box py={4} borderBottom="1.5px dashed #DEDFE2">
                  <Text color={COLORS.GRAY_MEDIUM}>Memo:</Text>
                  <Text fontSize="md">{transactionData?.memo}</Text>
                </Box>
              </VStack>
            </>
          )}
          {isLoading && (
            <>
              <Heading fontSize="2xl" mb={8}>
                Submitting Transaction
              </Heading>
              <Box py={8}>
                <Progress size="sm" isIndeterminate />
              </Box>
            </>
          )}
          {isSuccess && (
            <>
              <Heading fontSize="2xl" mb={8}>
                Transaction Submitted
              </Heading>
              <Text fontSize="md">
                Your transaction has been submitted. It may take a few minutes
                until it is confirmed. This transaction will appear in your
                activity as pending until it is confirmed.
              </Text>
            </>
          )}
          {isError && (
            <>
              <Heading fontSize="2xl" mb={8}>
                Transaction Error
              </Heading>
              <Text fontSize="md">
                Something went wrong, please review your transaction and try
                again.
              </Text>
            </>
          )}
        </ModalBody>

        <ModalFooter display="flex" gap={2} py={8}>
          {(isIdle || isLoading) && (
            <>
              <PillButton
                isDisabled={isLoading}
                onClick={handleClose}
                variant="inverted"
                height="60px"
                px={8}
                border={0}
              >
                Cancel Transaction
              </PillButton>
              <PillButton
                isDisabled={isLoading}
                height="60px"
                px={8}
                onClick={handleSubmit}
              >
                Confirm &amp; Send
              </PillButton>
            </>
          )}
          {isSuccess && (
            <>
              <PillButton
                height="60px"
                px={8}
                onClick={() => {
                  const account = transactionData?.fromAccount;
                  if (!account) {
                    handleClose();
                    return;
                  }
                  router.push(`/accounts/${account}`);
                }}
              >
                View Account Activity
              </PillButton>
              <PillButton
                height="60px"
                px={8}
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
                View Transaction
              </PillButton>
            </>
          )}
          {isError && (
            <>
              <PillButton
                isDisabled={isLoading}
                onClick={handleClose}
                variant="inverted"
                height="60px"
                px={8}
                border={0}
              >
                Cancel
              </PillButton>
              <PillButton
                isDisabled={isLoading}
                height="60px"
                px={8}
                onClick={handleSubmit}
              >
                Try Again
              </PillButton>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
