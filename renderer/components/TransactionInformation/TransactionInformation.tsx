import {
  Box,
  BoxProps,
  Grid,
  GridItem,
  Heading,
  Text,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { upperFirst } from "lodash-es";
import Image from "next/image";
import { defineMessages, useIntl } from "react-intl";

import pinkClock from "@/images/pink-clock.svg";
import pinkCompass from "@/images/pink-compass.svg";
import pinkCube from "@/images/pink-cube.svg";
import pinkHash from "@/images/pink-hash.svg";
import pinkInformation from "@/images/pink-information.svg";
import pinkSquareStack from "@/images/pink-square-stack.svg";
import { TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { ShadowCard } from "@/ui/ShadowCard/ShadowCard";
import { formatDate } from "@/utils/formatDate";
import { formatOre } from "@/utils/ironUtils";
import { truncateString } from "@/utils/truncateString";

type Transaction = TRPCRouterOutputs["getTransaction"]["transaction"];

type Props = BoxProps & {
  transaction: Transaction;
};

const messages = defineMessages({
  status: {
    defaultMessage: "Status",
  },
  transactionHash: {
    defaultMessage: "Transaction Hash",
  },
  timestamp: {
    defaultMessage: "Timestamp",
  },
  fee: {
    defaultMessage: "Fee",
  },
  submittedSequence: {
    defaultMessage: "Submitted Sequence",
  },
  blockSequence: {
    defaultMessage: "Block Sequence",
  },
  transactionInformation: {
    defaultMessage: "Transaction Information",
  },
});

const ITEMS = [
  {
    label: messages.status,
    icon: <Image src={pinkInformation} alt="" />,
    render: (transaction: Transaction) => upperFirst(transaction.status),
  },
  {
    label: messages.transactionHash,
    icon: <Image src={pinkHash} alt="" />,
    render: (transaction: Transaction) => truncateString(transaction.hash, 2),
  },
  {
    label: messages.timestamp,
    icon: <Image src={pinkClock} alt="" />,
    render: (transaction: Transaction) => formatDate(transaction.timestamp),
  },
  {
    label: messages.fee,
    icon: <Image src={pinkCompass} alt="" />,
    render: (transaction: Transaction) => formatOre(transaction.fee) + " $IRON",
  },
  {
    label: messages.submittedSequence,
    icon: <Image src={pinkSquareStack} alt="" />,
    render: (transaction: Transaction) => transaction.submittedSequence,
  },
  {
    label: messages.blockSequence,
    icon: <Image src={pinkCube} alt="" />,
    render: (transaction: Transaction) => transaction.blockSequence ?? "—",
  },
];

export function TransactionInformation({ transaction, ...rest }: Props) {
  const { formatMessage } = useIntl();

  return (
    <Box {...rest}>
      <Heading as="h3" fontSize="2xl" mb={8}>
        {formatMessage(messages.transactionInformation)}
      </Heading>
      <Grid templateColumns="repeat(3, 1fr)" gap={5}>
        {ITEMS.map(({ label, icon, render }) => (
          <GridItem
            key={label.defaultMessage}
            display="flex"
            alignItems="stretch"
          >
            <ShadowCard
              contentContainerProps={{
                p: 8,
                display: "flex",
                alignItems: "center",
              }}
              w="100%"
            >
              <HStack justifyContent="space-between" w="100%">
                <VStack alignItems="flex-start">
                  <Text
                    color={COLORS.GRAY_MEDIUM}
                    fontSize="md"
                    _dark={{
                      color: COLORS.DARK_MODE.GRAY_LIGHT,
                    }}
                  >
                    {formatMessage(label)}
                  </Text>
                  <Text fontSize="md">{render(transaction)}</Text>
                </VStack>
                {icon}
              </HStack>
            </ShadowCard>
          </GridItem>
        ))}
      </Grid>
    </Box>
  );
}
