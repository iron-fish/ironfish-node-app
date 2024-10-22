import {
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  ModalFooter,
  Skeleton,
  Box,
  Spinner,
  Progress,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { defineMessages, useIntl } from "react-intl";

import { trpcReact, TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";
import { CurrencyUtils } from "@/utils/currency";
import { formatOre } from "@/utils/ironUtils";
import { IRON_ID, IRON_SYMBOL } from "@shared/constants";

import { StepIdle } from "./StepIdle";
import { AssetOptionType } from "../../AssetAmountInput/utils";
import { BridgeAssetsConfirmationData } from "../bridgeAssetsSchema";

const messages = defineMessages({
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
  errorHeading: {
    defaultMessage: "An error occurred",
  },
  transactionErrorText: {
    defaultMessage:
      "Something went wrong. Please review your transaction and try again.",
  },
  error: {
    defaultMessage: "Error",
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
  confirmAndBridge: {
    defaultMessage: "Confirm & Bridge",
  },
});

type ChainportToken = NonNullable<
  TRPCRouterOutputs["getChainportTokens"]["chainportTokensMap"][number]
>;
type ChainportNetwork =
  TRPCRouterOutputs["getChainportTokenPaths"]["chainportTokenPaths"][number];

type Props = {
  onClose: () => void;
  formData: BridgeAssetsConfirmationData;
  destinationNetwork: ChainportNetwork;
  selectedAsset: AssetOptionType;
  chainportToken: ChainportToken;
  handleTransactionDetailsError: (error: string) => void;
};

export function BridgeConfirmationModal({
  onClose,
  formData,
  destinationNetwork,
  selectedAsset,
  chainportToken,
  handleTransactionDetailsError,
}: Props) {
  const { formatMessage } = useIntl();
  const router = useRouter();

  const [feeRate, setFeeRate] = useState<"slow" | "average" | "fast">(
    "average",
  );

  const [convertedAmount, convertedAmountError] = CurrencyUtils.tryMajorToMinor(
    formData.amount,
    selectedAsset.asset.id,
    {
      decimals: chainportToken.decimals,
    },
  );

  if (convertedAmountError) {
    throw convertedAmountError;
  }

  const {
    data: txDetails,
    isError: isTransactionDetailError,
    error: transactionDetailError,
    isFetching: isTransactionDetailsLoading,
  } = trpcReact.getChainportBridgeTransactionDetails.useQuery(
    {
      amount: convertedAmount.toString(),
      assetId: chainportToken.web3_address,
      to: formData.destinationAddress,
      selectedNetwork: destinationNetwork.chainport_network_id,
    },
    {
      retry: false,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      cacheTime: 0,
    },
  );

  useEffect(() => {
    if (isTransactionDetailError) {
      onClose();
      handleTransactionDetailsError(transactionDetailError.message);
    }
  }, [
    onClose,
    handleTransactionDetailsError,
    isTransactionDetailError,
    transactionDetailError?.message,
  ]);

  const {
    mutate: submitBridgeTransaction,
    data: submitBridgeTransactionData,
    isIdle: isSubmitIdle,
    isLoading: isSubmitLoading,
    isError: isSubmitError,
    isSuccess: isSubmitSuccess,
    reset,
    error: submitError,
  } = trpcReact.sendChainportBridgeTransaction.useMutation();

  const getEstimatedFeesQuery = trpcReact.getEstimatedFees.useQuery(
    {
      accountName: formData.fromAccount,
      outputs: txDetails
        ? [txDetails.bridge_output, txDetails.gas_fee_output]
        : [],
    },
    {
      cacheTime: 0,
      enabled: isSubmitIdle && !!txDetails,
      refetchOnWindowFocus: false,
      retry: false,
    },
  );
  const {
    data: estimatedFeesData,
    isLoading: isEstimatedFeesLoading,
    isError: isEstimatedFeesError,
  } = getEstimatedFeesQuery;

  const amountToSend = useMemo(() => {
    const amount = CurrencyUtils.formatCurrency(
      convertedAmount,
      chainportToken.decimals,
    );
    return `${amount} ${selectedAsset.assetName}`;
  }, [selectedAsset.assetName, convertedAmount, chainportToken.decimals]);

  const amountToReceive = useMemo(() => {
    if (isTransactionDetailsLoading || !txDetails) {
      return <Skeleton>PLACEHOLDER</Skeleton>;
    }

    const bridgeAmount =
      BigInt(txDetails.bridge_output.amount) -
      BigInt(txDetails.bridge_fee.source_token_fee_amount ?? 0);

    const convertedAmount = CurrencyUtils.formatCurrency(
      bridgeAmount,
      chainportToken.decimals,
    );

    return `${convertedAmount} ${
      chainportToken.web3_address === IRON_ID
        ? IRON_SYMBOL
        : chainportToken.symbol
    }`;
  }, [
    isTransactionDetailsLoading,
    txDetails,
    chainportToken.decimals,
    chainportToken.symbol,
    chainportToken.web3_address,
  ]);

  const chainportGasFee = useMemo(() => {
    if (isTransactionDetailsLoading || !txDetails) {
      return <Skeleton>123 FOO</Skeleton>;
    }

    return `${formatOre(txDetails.gas_fee_output.amount ?? 0)} $IRON`;
  }, [isTransactionDetailsLoading, txDetails]);

  const chainportBridgeFee = useMemo(() => {
    if (isTransactionDetailsLoading || !txDetails) {
      return <Skeleton>123 FOO</Skeleton>;
    }

    if (txDetails.bridge_fee.is_portx_fee_payment) {
      const fee = CurrencyUtils.formatCurrency(
        txDetails.bridge_fee.portx_fee_amount,
        18,
      );
      return `${fee} PORTX`;
    }

    return `${CurrencyUtils.formatCurrency(
      txDetails.bridge_fee.source_token_fee_amount,
      chainportToken.decimals,
    )} ${selectedAsset.assetName}`;
  }, [
    isTransactionDetailsLoading,
    txDetails,
    chainportToken.decimals,
    selectedAsset.assetName,
  ]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);
  const handleSubmit = useCallback(() => {
    if (!txDetails || !estimatedFeesData) return;

    submitBridgeTransaction({
      fromAccount: formData.fromAccount,
      txDetails,
      fee: estimatedFeesData[feeRate],
    });
  }, [
    estimatedFeesData,
    feeRate,
    formData.fromAccount,
    submitBridgeTransaction,
    txDetails,
  ]);

  return (
    <Modal isOpen onClose={handleClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="600px" position="relative">
        {isTransactionDetailsLoading && (
          <Box
            position="absolute"
            inset={0}
            zIndex={9}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Spinner />
          </Box>
        )}
        <ModalBody
          px={16}
          pt={16}
          opacity={isTransactionDetailsLoading ? 0.6 : 1}
        >
          {isSubmitIdle && (
            <StepIdle
              fromAccount={formData.fromAccount}
              destinationNetwork={destinationNetwork.label}
              destinationNetworkIcon={destinationNetwork.network_icon}
              amountSending={amountToSend}
              amountReceiving={amountToReceive}
              destinationAddress={formData.destinationAddress}
              chainportGasFee={chainportGasFee}
              chainportBridgeFee={chainportBridgeFee}
              feeRate={feeRate}
              onFeeRateChange={(nextValue) => {
                setFeeRate(nextValue);
              }}
              estimatedFees={getEstimatedFeesQuery}
            />
          )}
          {isSubmitLoading && (
            <>
              <Heading fontSize="2xl" mb={8}>
                {formatMessage(messages.submittingTransaction)}
              </Heading>
              <Box py={8}>
                <Progress size="sm" isIndeterminate />
              </Box>
            </>
          )}
          {isSubmitSuccess && (
            <>
              <Heading fontSize="2xl" mb={8}>
                {formatMessage(messages.transactionSubmitted)}
              </Heading>
              <Text fontSize="md">
                {formatMessage(messages.transactionSubmittedText)}
              </Text>
            </>
          )}
          {isSubmitError && (
            <>
              <Heading fontSize="2xl" mb={8}>
                {formatMessage(messages.errorHeading)}
              </Heading>
              <Text fontSize="md">
                {formatMessage(messages.transactionErrorText)}
              </Text>

              <Heading fontSize="lg" mt={8} mb={2}>
                {formatMessage(messages.error)}
              </Heading>
              <code>{submitError.message}</code>
            </>
          )}
        </ModalBody>

        <ModalFooter display="flex" gap={2} px={16} py={8}>
          {(isSubmitIdle || isSubmitLoading) && (
            <>
              <PillButton
                size="sm"
                variant="inverted"
                type="button"
                onClick={handleClose}
                border={0}
                isDisabled={isSubmitLoading}
              >
                {formatMessage(messages.cancel)}
              </PillButton>
              <PillButton
                size="sm"
                type="button"
                onClick={handleSubmit}
                isDisabled={
                  isTransactionDetailsLoading ||
                  isTransactionDetailError ||
                  isEstimatedFeesLoading ||
                  isEstimatedFeesError ||
                  isSubmitLoading
                }
              >
                {formatMessage(messages.confirmAndBridge)}
              </PillButton>
            </>
          )}
          {isSubmitSuccess && (
            <>
              <PillButton
                size="sm"
                onClick={() => {
                  const account = formData.fromAccount;
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
                  const account = formData.fromAccount;
                  const transactionHash = submitBridgeTransactionData?.hash;
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
          {isSubmitError && (
            <>
              <PillButton
                size="sm"
                isDisabled={isSubmitLoading}
                onClick={handleClose}
                variant="inverted"
                border={0}
              >
                {formatMessage(messages.cancel)}
              </PillButton>
              <PillButton
                size="sm"
                isDisabled={isSubmitLoading}
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
