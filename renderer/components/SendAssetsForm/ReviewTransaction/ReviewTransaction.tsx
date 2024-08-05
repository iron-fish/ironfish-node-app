import {
  ModalFooter,
  ModalBody,
  Heading,
  Text,
  VStack,
  Box,
  HStack,
} from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { AssetOptionType } from "@/components/AssetAmountInput/utils";
import { LedgerChip } from "@/components/LedgerChip/LedgerChip";
import { TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";
import { CurrencyUtils } from "@/utils/currency";
import { formatOre } from "@/utils/ironUtils";

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
  transactionData: TransactionData;
  selectedAccount: TRPCRouterOutputs["getAccounts"][number];
  onClose: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  selectedAsset?: AssetOptionType;
};

export function ReviewTransaction({
  transactionData,
  selectedAccount,
  selectedAsset,
  isLoading,
  onClose,
  onSubmit,
}: Props) {
  const { formatMessage } = useIntl();

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
                transactionData.amount.toString(),
                transactionData.assetId,
                selectedAsset?.asset.verification,
              )}{" "}
              {selectedAsset?.assetName ?? formatMessage(messages.unknownAsset)}
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
        <PillButton size="sm" isDisabled={isLoading} onClick={onSubmit}>
          {formatMessage(messages.confirmAndSend)}
        </PillButton>
      </ModalFooter>
    </>
  );
}
