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
import { useCallback, useMemo, useState } from "react";
import { defineMessages, useIntl } from "react-intl";

import { trpcReact, TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";
import { CurrencyUtils } from "@/utils/currency";
import { formatOre } from "@/utils/ironUtils";

import { StepIdle } from "./StepIdle";
import { AssetOptionType } from "../../AssetAmountInput/utils";
import { BridgeAssetsFormData } from "../bridgeAssetsSchema";

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

type ChainportToken =
  TRPCRouterOutputs["getChainportTokens"]["chainportTokens"][number];
type ChainportTargetNetwork = ChainportToken["targetNetworks"][number];

type Props = {
  onClose: () => void;
  formData: BridgeAssetsFormData;
  targetNetwork: ChainportTargetNetwork;
  selectedAsset: AssetOptionType;
  chainportToken: ChainportToken;
};

export function BridgeConfirmationModal({
  onClose,
  formData,
  targetNetwork,
  selectedAsset,
  chainportToken,
}: Props) {
  const { formatMessage } = useIntl();
  const router = useRouter();

  const [feeRate, setFeeRate] = useState<"slow" | "average" | "fast">(
    "average",
  );

  const [convertedAmount, convertedAmountError] = CurrencyUtils.tryMajorToMinor(
    formData.amount,
    selectedAsset.asset.id,
    selectedAsset.asset.verification,
  );

  if (convertedAmountError) {
    throw convertedAmountError;
  }

  const {
    data: txDetails,
    isLoading: isTransactionDetailsLoading,
    isError: isTransactionDetailError,
  } = trpcReact.getChainportBridgeTransactionDetails.useQuery({
    amount: convertedAmount.toString(),
    assetId: chainportToken.ironfishId,
    to: formData.targetAddress,
    selectedNetwork: targetNetwork.chainportNetworkId.toString(),
  });

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

  const { data: estimatedFeesData, error: estimatedFeesError } =
    trpcReact.getChainportBridgeTransactionEstimatedFees.useQuery(
      {
        fromAccount: formData.fromAccount,
        txDetails: txDetails!,
      },
      {
        enabled: isSubmitIdle && !!txDetails,
      },
    );

  const amountToReceive = useMemo(() => {
    if (isTransactionDetailsLoading || !txDetails) {
      return <Skeleton>PLACEHOLDER</Skeleton>;
    }

    const bridgeAmount =
      BigInt(txDetails.bridge_output.amount) -
      BigInt(txDetails.bridge_fee.source_token_fee_amount ?? 0);

    const convertedAmount = CurrencyUtils.render(
      bridgeAmount,
      selectedAsset.asset.id,
      selectedAsset.asset.verification,
    );

    return convertedAmount + " " + chainportToken.symbol;
  }, [
    selectedAsset.asset.id,
    selectedAsset.asset.verification,
    txDetails,
    chainportToken.symbol,
    isTransactionDetailsLoading,
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
      const fee = CurrencyUtils.render(
        BigInt(txDetails.bridge_fee.portx_fee_amount),
        undefined,
        {
          decimals: 18,
        },
      );
      return `${fee} PORTX`;
    }

    return `${formatOre(
      txDetails.bridge_fee.source_token_fee_amount ?? 0,
    )} $IRON`;
  }, [isTransactionDetailsLoading, txDetails]);

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
              targetNetwork={targetNetwork.label}
              targetNetworkIcon={targetNetwork.networkIcon}
              amount={formData.amount}
              assetName={selectedAsset.assetName}
              amountReceiving={amountToReceive}
              targetAddress={formData.targetAddress}
              chainportGasFee={chainportGasFee}
              chainportBridgeFee={chainportBridgeFee}
              feeRate={feeRate}
              onFeeRateChange={(nextValue) => {
                setFeeRate(nextValue);
              }}
              txDetails={txDetails}
              error={estimatedFeesError?.message}
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
                {formatMessage(messages.transactionError)}
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
