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
import { formatTransactionHash } from "@/utils/formatTransactionHash";
import { formatOre } from "@/utils/ironUtils";

type Transaction = TRPCRouterOutputs["getTransaction"]["transaction"];

type Props = BoxProps & {
  transaction: Transaction;
};

const ITEMS = [
  {
    label: "Status",
    icon: <Image src={pinkInformation} alt="" />,
    render: (transaction: Transaction) => upperFirst(transaction.status),
  },
  {
    label: "Transaction Hash",
    icon: <Image src={pinkHash} alt="" />,
    render: (transaction: Transaction) =>
      formatTransactionHash(transaction.hash),
  },
  {
    label: "Timestamp",
    icon: <Image src={pinkClock} alt="" />,
    render: (transaction: Transaction) => formatDate(transaction.timestamp),
  },
  {
    label: "Fee",
    icon: <Image src={pinkCompass} alt="" />,
    render: (transaction: Transaction) => formatOre(transaction.fee) + " $IRON",
  },
  {
    label: "Submitted Sequence",
    icon: <Image src={pinkSquareStack} alt="" />,
    render: (transaction: Transaction) => transaction.submittedSequence,
  },
  {
    label: "Block Sequence",
    icon: <Image src={pinkCube} alt="" />,
    render: (transaction: Transaction) => transaction.blockSequence ?? "—",
  },
];

export function TransactionInformation({ transaction, ...rest }: Props) {
  return (
    <Box {...rest}>
      <Heading as="h3" fontSize="2xl" mb={8}>
        Transaction Information
      </Heading>
      <Grid templateColumns="repeat(3, 1fr)" gap={5}>
        {ITEMS.map(({ label, icon, render }) => (
          <GridItem key={label} display="flex" alignItems="stretch">
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
                    {label}
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
