import {
  Heading,
  VStack,
  Grid,
  GridItem,
  Flex,
  Code,
  Text,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { defineMessages, useIntl } from "react-intl";

import chainportIcon from "@/images/chainport/chainport-icon-lg.png";
import ironfishIcon from "@/images/chainport/ironfish-icon.png";
import { trpcReact, TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { Select } from "@/ui/Forms/Select/Select";
import { BridgeArrows } from "@/ui/SVGs/BridgeArrows";
import { formatOre } from "@/utils/ironUtils";

import { LineItem, Divider } from "../../LineItem/LineItem";

const messages = defineMessages({
  heading: {
    defaultMessage: "Confirm Bridge Transaction",
  },
  fromLabel: {
    defaultMessage: "From",
  },
  bridgeProviderLabel: {
    defaultMessage: "Bridge Provider",
  },
  sourceNetworkLabel: {
    defaultMessage: "Source Network",
  },
  targetNetworkLabel: {
    defaultMessage: "Target Network",
  },
  sendingLabel: {
    defaultMessage: "Sending",
  },
  receivingLabel: {
    defaultMessage: "Receiving",
  },
  targetAddressLabel: {
    defaultMessage: "Target Address",
  },
  gasFeeLabel: {
    defaultMessage: "Gas fee",
  },
  gasFeeTooltip: {
    defaultMessage: "The fee for transacting on the destination chain",
  },
  bridgeFeeLabel: {
    defaultMessage: "Bridge fee",
  },
  bridgeFeeTooltip: {
    defaultMessage: "The bridge provider's fee",
  },
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

type TxDetails = TRPCRouterOutputs["getChainportBridgeTransactionDetails"];

type Props = {
  fromAccount: string;
  targetNetwork: string;
  targetNetworkIcon: string;
  amount: string;
  assetName: string;
  amountReceiving: ReactNode;
  targetAddress: string;
  chainportGasFee: ReactNode;
  chainportBridgeFee: ReactNode;
  feeRate: string;
  onFeeRateChange: (nextValue: "slow" | "average" | "fast") => void;
  txDetails?: TxDetails;
  error?: string;
};

export function StepIdle({
  fromAccount,
  targetNetwork,
  targetNetworkIcon,
  amount,
  assetName,
  amountReceiving,
  targetAddress,
  chainportGasFee,
  chainportBridgeFee,
  feeRate,
  onFeeRateChange,
  txDetails,
  error,
}: Props) {
  const { formatMessage } = useIntl();

  const { data: estimatedFeesData } =
    trpcReact.getChainportBridgeTransactionEstimatedFees.useQuery(
      {
        fromAccount: fromAccount,
        txDetails: txDetails!,
      },
      {
        enabled: !!txDetails,
      },
    );

  return (
    <>
      <Heading fontSize="2xl" mb={8}>
        {formatMessage(messages.heading)}
      </Heading>

      <VStack alignItems="stretch">
        <LineItem
          label={formatMessage(messages.fromLabel)}
          content={fromAccount}
        />

        <Divider />

        <LineItem
          label={formatMessage(messages.bridgeProviderLabel)}
          content="Chainport"
          icon={chainportIcon}
          href="https://www.chainport.io/"
        />

        <Divider />

        <Grid templateColumns="auto 1fr auto">
          <GridItem>
            <LineItem
              label={formatMessage(messages.sourceNetworkLabel)}
              content="Iron Fish"
              icon={ironfishIcon}
            />
          </GridItem>
          <GridItem>
            <LineItem
              label={formatMessage(messages.targetNetworkLabel)}
              content={targetNetwork}
              icon={targetNetworkIcon}
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
              label={formatMessage(messages.sendingLabel)}
              content={`${amount} ${assetName}`}
              icon={ironfishIcon}
            />
          </GridItem>
          <GridItem>
            <LineItem
              label={formatMessage(messages.receivingLabel)}
              content={amountReceiving}
              icon={chainportIcon}
            />
          </GridItem>
        </Grid>

        <Divider />

        <LineItem
          label={formatMessage(messages.targetAddressLabel)}
          content={targetAddress}
        />

        <Divider />

        <Select
          name="fees"
          value={feeRate}
          onChange={async (e) => {
            onFeeRateChange(e.target.value);
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
        <LineItem
          label={formatMessage(messages.gasFeeLabel)}
          tooltip={formatMessage(messages.gasFeeTooltip)}
          content={chainportGasFee}
        />
        <LineItem
          label={formatMessage(messages.bridgeFeeLabel)}
          tooltip={formatMessage(messages.bridgeFeeTooltip)}
          content={chainportBridgeFee}
        />

        <Divider />

        {error && (
          <Code
            colorScheme="red"
            p={4}
            maxH="400px"
            maxW="100%"
            w="100%"
            overflow="auto"
            mb={6}
          >
            <Text>{error}</Text>
          </Code>
        )}
      </VStack>
    </>
  );
}
