import {
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  VStack,
  Grid,
  GridItem,
  Flex,
  ModalFooter,
  Skeleton,
  Box,
  Spinner,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { defineMessages, useIntl } from "react-intl";

import { trpcReact, TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { Select } from "@/ui/Forms/Select/Select";
import { PillButton } from "@/ui/PillButton/PillButton";
import { BridgeArrows } from "@/ui/SVGs/BridgeArrows";
import { CurrencyUtils } from "@/utils/currency";
import { formatOre } from "@/utils/ironUtils";

import chainportIcon from "./assets/chainport-icon.png";
import ironfishIcon from "./assets/ironfish-icon.png";
import { BridgeAssetsFormData } from "./bridgeAssetsSchema";
import { AssetOptionType } from "../AssetAmountInput/utils";
import { LineItem, Divider } from "../LineItem/LineItem";

const messages = defineMessages({
  feeLabel: {
    defaultMessage: "Iron Fish transaction fee",
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

  const { data: estimatedFeesData } =
    trpcReact.getChainportBridgeTransactionEstimatedFees.useQuery(
      {
        fromAccount: formData.fromAccount,
        txDetails: txDetails!,
      },
      {
        enabled: !!txDetails,
      },
    );

  const { mutate: submitBridgeTransaction } =
    trpcReact.sendChainportBridgeTransaction.useMutation();

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

  return (
    <Modal isOpen onClose={onClose}>
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
          <Heading fontSize="2xl" mb={8}>
            Confirm Bridge Transaction
          </Heading>

          <VStack alignItems="stretch">
            <LineItem label="From" content={formData.fromAccount} />

            <Divider />

            <LineItem
              label="Bridge Provider"
              content="Chainport"
              icon={chainportIcon}
              href="https://www.chainport.io/"
            />

            <Divider />

            <Grid templateColumns="auto 1fr auto">
              <GridItem>
                <LineItem
                  label="Source Network"
                  content="Iron Fish"
                  icon={ironfishIcon}
                />
              </GridItem>
              <GridItem>
                <LineItem
                  label="Target Network"
                  content={targetNetwork.label}
                  icon={targetNetwork.networkIcon}
                />
              </GridItem>
              <GridItem
                rowSpan={2}
                rowStart={1}
                colStart={2}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Flex
                  bg="#F3DEF5"
                  color={COLORS.ORCHID}
                  border="3px solid white"
                  borderRadius={4}
                  alignItems="center"
                  justifyContent="center"
                  h="39px"
                  w="42px"
                >
                  <BridgeArrows />
                </Flex>
              </GridItem>
              <GridItem>
                <LineItem
                  label="Sending"
                  content={`${formData.amount} ${selectedAsset.assetName}`}
                  icon={ironfishIcon}
                />
              </GridItem>
              <GridItem>
                <LineItem
                  label="Receiving"
                  content={amountToReceive}
                  icon={chainportIcon}
                />
              </GridItem>
            </Grid>

            <Divider />

            <LineItem label="Target Address" content={formData.targetAddress} />

            <Divider />

            <Select
              name="fees"
              value={feeRate}
              onChange={async (e) => {
                setFeeRate(e.target.value);
              }}
              label={formatMessage(messages.feeLabel)}
              options={[
                {
                  label:
                    formatMessage(messages.slowFeeLabel) +
                    (estimatedFeesData
                      ? ` (${formatOre(estimatedFeesData.slow)} $IRON)`
                      : ""),
                  value: "slow",
                },
                {
                  label:
                    formatMessage(messages.averageFeeLabel) +
                    (estimatedFeesData
                      ? ` (${formatOre(estimatedFeesData.average)} $IRON)`
                      : ""),
                  value: "average",
                },
                {
                  label:
                    formatMessage(messages.fastFeeLabel) +
                    (estimatedFeesData
                      ? ` (${formatOre(estimatedFeesData.fast)} $IRON)`
                      : ""),
                  value: "fast",
                },
              ]}
            />
            <LineItem label="Gas fee" content={chainportGasFee} />
            <LineItem label="Bridge fee" content={chainportBridgeFee} />

            <Divider />
          </VStack>
        </ModalBody>

        <ModalFooter display="flex" gap={2} px={16} py={8}>
          <PillButton
            size="sm"
            variant="inverted"
            type="button"
            onClick={onClose}
            border={0}
          >
            Cancel
          </PillButton>
          <PillButton
            size="sm"
            type="button"
            onClick={() => {
              if (!txDetails || !estimatedFeesData) return;

              submitBridgeTransaction({
                fromAccount: formData.fromAccount,
                txDetails,
                fee: estimatedFeesData[feeRate],
              });
            }}
            isDisabled={isTransactionDetailsLoading || isTransactionDetailError}
          >
            Confirm & Bridge
          </PillButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
