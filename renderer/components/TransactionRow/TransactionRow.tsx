import { ChevronRightIcon } from "@chakra-ui/icons";
import { Grid, GridItem, HStack, Text } from "@chakra-ui/react";
import type { TransactionType } from "@ironfish/sdk";

import { ChakraLink } from "@/ui/ChakraLink/ChakraLink";
import { COLORS } from "@/ui/colors";
import { ShadowCard } from "@/ui/ShadowCard/ShadowCard";
import { formatAddress } from "@/utils/addressUtils";
import { formatDate } from "@/utils/formatDate";
import { hexToASCIIString } from "@/utils/hexToASCIIString";
import { formatOre } from "@/utils/ironUtils";

import { ReceivedIcon } from "./icons/ReceivedIcon";
import { SentIcon } from "./icons/SentIcon";

export function TransactionsHeadings() {
  return (
    <Grid
      templateColumns={{
        base: `repeat(5, 1fr)`,
        md: `repeat(5, 1fr) 55px`,
      }}
      opacity="0.8"
      mb={4}
    >
      <GridItem pl={8}>
        <Text as="span">Action</Text>
      </GridItem>
      <GridItem>
        <Text as="span">Amount</Text>
      </GridItem>
      <GridItem>
        <Text as="span">From/To</Text>
      </GridItem>
      <GridItem>
        <Text as="span">Date</Text>
      </GridItem>
      <GridItem>
        <Text as="span">Memo</Text>
      </GridItem>
    </Grid>
  );
}

export function TransactionRow({
  accountName,
  assetName,
  value,
  timestamp,
  from,
  to,
  type,
  memo,
  transactionHash,
}: {
  accountName: string;
  assetName: string;
  value: string;
  timestamp: number;
  from: string;
  to: string;
  type: TransactionType;
  memo: string;
  transactionHash: string;
}) {
  return (
    <ChakraLink
      href={`/accounts/${accountName}/transaction/${transactionHash}`}
      w="100%"
    >
      <ShadowCard
        hoverable
        height="86px"
        contentContainerProps={{
          display: "flex",
          alignItems: "center",
          p: 0,
        }}
        mb={4}
      >
        <Grid
          templateColumns={{
            base: `repeat(5, 1fr)`,
            md: `repeat(5, 1fr) 55px`,
          }}
          opacity="0.8"
          w="100%"
          gap={4}
        >
          <GridItem display="flex" alignItems="center" pl={8}>
            <HStack gap={4}>
              {type === "send" ? <SentIcon /> : <ReceivedIcon />}
              <Text as="span">{type === "send" ? "Sent" : "Received"}</Text>
            </HStack>
          </GridItem>
          <GridItem display="flex" alignItems="center">
            <Text as="span">
              {formatOre(value)} {hexToASCIIString(assetName)}
            </Text>
          </GridItem>
          <GridItem display="flex" alignItems="center">
            <Text as="span">{formatAddress(type === "send" ? to : from)}</Text>
          </GridItem>
          <GridItem display="flex" alignItems="center">
            <Text as="span">{formatDate(timestamp)}</Text>
          </GridItem>
          <GridItem display="flex" alignItems="center">
            <Text as="span">{memo || "—"}</Text>
          </GridItem>
          <GridItem
            alignItems="center"
            display={{
              base: "none",
              md: "flex",
            }}
          >
            <ChevronRightIcon
              boxSize={5}
              color={COLORS.GRAY_MEDIUM}
              _dark={{ color: COLORS.DARK_MODE.GRAY_LIGHT }}
            />
          </GridItem>
        </Grid>
      </ShadowCard>
    </ChakraLink>
  );
}
