import {
  ModalFooter,
  ModalBody,
  Heading,
  Text,
  VStack,
  Box,
  HStack,
} from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";

import { AssetOptionType } from "@/components/AssetAmountInput/utils";
import { LedgerChip } from "@/components/LedgerChip/LedgerChip";
import { TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";
import { CurrencyUtils } from "@/utils/currency";
import { RenderError } from "@/ui/Forms/FormField/FormField";

import FeeGridSelector from "./FeeGridSelector/FeeGridSelector";
import { MemoInput } from "./MemoInput/MemoInput";

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
  feeLabel: {
    defaultMessage: "Fee ($IRON)",
  },
  slowFeeLabel: {
    defaultMessage: "Slow",
  },
  averageFeeLabel: {
    defaultMessage: "Average",
  },
  fastFeeLabel: {
    defaultMessage: "Fast",
  },
  cancelTransaction: {
    defaultMessage: "Cancel Transaction",
  },
  confirmAndSend: {
    defaultMessage: "Confirm & Send",
  },
  unknownAsset: {
    defaultMessage: "unknown asset",
  },
});

type Props = {
  selectedAccount: TRPCRouterOutputs["getAccounts"][number];
  onClose: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  selectedAsset: AssetOptionType;
  estimatedFeesData: TRPCRouterOutputs["getEstimatedFees"] | undefined;
};

export function ReviewTransaction({
  selectedAccount,
  selectedAsset,
  isLoading,
  onClose,
  onSubmit,
  estimatedFeesData,
}: Props) {
  const { formatMessage } = useIntl();
  const {
    watch,
    formState: { errors },
  } = useFormContext();
  const transactionData = watch();

  const [convertedAmount, conversionError] = CurrencyUtils.tryMajorToMinor(
    transactionData.amount.toString(),
    transactionData.assetId,
    selectedAsset?.asset.verification,
  );

  const hasErrors = Object.keys(errors).length > 0 || conversionError;

  return (
    <>
      <ModalBody px={16} pt={16}>
        <Heading fontSize="2xl" mb={8}>
          {formatMessage(messages.confirmTransactionDetails)}
        </Heading>

        <VStack alignItems="stretch">
          <Box py={4} borderBottom="1.5px dashed #DEDFE2">
            <Text color={COLORS.GRAY_MEDIUM}>
              {formatMessage(messages.from)}
            </Text>
            <HStack justifyContent="space-between">
              <Text fontSize="md">{selectedAccount?.name}</Text>
              {selectedAccount?.isLedger && <LedgerChip />}
            </HStack>
          </Box>
          <Box py={4} borderBottom="1.5px dashed #DEDFE2">
            <Text color={COLORS.GRAY_MEDIUM}>{formatMessage(messages.to)}</Text>
            <Text fontSize="md">{transactionData?.toAccount ?? ""}</Text>
          </Box>
          <Box py={4} borderBottom="1.5px dashed #DEDFE2">
            <Text color={COLORS.GRAY_MEDIUM}>
              {formatMessage(messages.amount)}
            </Text>
            <Text fontSize="md">
              {CurrencyUtils.render(
                convertedAmount?.toString() ?? "0",
                transactionData.assetId,
                selectedAsset?.asset.verification,
              )}{" "}
              {selectedAsset?.assetName ?? formatMessage(messages.unknownAsset)}
            </Text>
          </Box>
          <FeeGridSelector
            selectedAsset={selectedAsset}
            estimatedFeesData={estimatedFeesData}
          />
          <MemoInput />
          {hasErrors && (
            <Box py={4} borderBottom="1.5px dashed #DEDFE2">
              <Text color={COLORS.RED} fontWeight="bold">
                Errors:
              </Text>
              {Object.entries(errors).map(([key, error]) => (
                <RenderError key={key} error={(error as any)?.message} />
              ))}
              {conversionError && (
                <RenderError error="Error converting amount. Please check your input." />
              )}
            </Box>
          )}
        </VStack>
      </ModalBody>

      <ModalFooter display="flex" gap={2} px={16} py={8}>
        <PillButton
          size="sm"
          isDisabled={isLoading}
          onClick={onClose}
          variant="inverted"
          border={0}
        >
          {formatMessage(messages.cancelTransaction)}
        </PillButton>
        <PillButton
          size="sm"
          isDisabled={isLoading || !!hasErrors}
          onClick={() => {
            const hasErrors = checkForErrors();
            onSubmit();
          }}
        >
          {formatMessage(messages.confirmAndSend)}
        </PillButton>
      </ModalFooter>
    </>
  );
}
