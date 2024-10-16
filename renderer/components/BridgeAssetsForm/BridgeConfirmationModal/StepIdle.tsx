import {
  Heading,
  VStack,
  Grid,
  GridItem,
  Flex,
  Code,
  Text,
  Box,
} from "@chakra-ui/react";
import { UseTRPCQueryResult } from "@trpc/react-query/dist/shared";
import { ReactNode } from "react";
import { defineMessages, useIntl } from "react-intl";

import chainportIcon from "@/images/chainport/chainport-icon-lg.png";
import ironfishIcon from "@/images/chainport/ironfish-icon.png";
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
  bridgeProviderTerms: {
    defaultMessage:
      "By bridging your assets, you agree to Chainport's <link>terms of service</link>.",
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
    defaultMessage: "Receiving (Estimated)",
  },
  receivingTooltip: {
    defaultMessage:
      "Sending amount minus the bridge fee. This is an estimate, and you may receive a slightly different amount.",
  },
  targetAddressLabel: {
    defaultMessage: "Target Address",
  },
  gasFeeLabel: {
    defaultMessage: "Gas fee",
  },
  gasFeeTooltip: {
    defaultMessage: "The fee for transacting on the target network",
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

type Props = {
  fromAccount: string;
  targetNetwork: string;
  targetNetworkIcon: string;
  amountSending: ReactNode;
  amountSendingIcon: string | undefined;
  amountReceiving: ReactNode;
  amountReceivingIcon: string;
  targetAddress: string;
  chainportGasFee: ReactNode;
  chainportBridgeFee: ReactNode;
  estimatedFees: UseTRPCQueryResult<
    { slow: number; average: number; fast: number },
    { message: string }
  >;
  feeRate: string;
  onFeeRateChange: (nextValue: "slow" | "average" | "fast") => void;
  error?: string;
};

export function StepIdle({
  fromAccount,
  targetNetwork,
  targetNetworkIcon,
  amountSending,
  amountSendingIcon,
  amountReceiving,
  amountReceivingIcon,
  targetAddress,
  chainportGasFee,
  chainportBridgeFee,
  estimatedFees,
  feeRate,
  onFeeRateChange,
}: Props) {
  const { formatMessage } = useIntl();

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

        <Text
          color={COLORS.GRAY_MEDIUM}
          _dark={{
            color: COLORS.DARK_MODE.GRAY_LIGHT,
          }}
        >
          {formatMessage(messages.bridgeProviderTerms, {
            link: (msg: ReactNode) => (
              <Box
                as="a"
                rel="noreferrer"
                target="_blank"
                textDecoration="underline"
                href="https://www.chainport.io/terms-of-services"
              >
                {msg}
              </Box>
            ),
          })}
        </Text>

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
            mx={8}
          >
            <Flex
              _dark={{
                bg: "#431848",
              }}
              bg="#F3DEF5"
              color={COLORS.ORCHID}
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
              content={amountSending}
              icon={amountSendingIcon ?? ironfishIcon}
            />
          </GridItem>
          <GridItem>
            <LineItem
              label={formatMessage(messages.receivingLabel)}
              content={amountReceiving}
              tooltip={formatMessage(messages.receivingTooltip)}
              icon={amountReceivingIcon}
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
                (estimatedFees.data
                  ? ` (${formatOre(estimatedFees.data.slow)} $IRON)`
                  : ""),
              value: "slow",
            },
            {
              label:
                formatMessage(messages.averageFeeLabel) +
                (estimatedFees.data
                  ? ` (${formatOre(estimatedFees.data.average)} $IRON)`
                  : ""),
              value: "average",
            },
            {
              label:
                formatMessage(messages.fastFeeLabel) +
                (estimatedFees.data
                  ? ` (${formatOre(estimatedFees.data.fast)} $IRON)`
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

        {estimatedFees.isError && (
          <Code
            colorScheme="red"
            p={4}
            maxH="400px"
            maxW="100%"
            w="100%"
            overflow="auto"
            mb={6}
          >
            <Text>{estimatedFees.error?.message}</Text>
          </Code>
        )}
      </VStack>
    </>
  );
}
