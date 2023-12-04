import { ChevronRightIcon } from "@chakra-ui/icons";
import { Grid, GridItem, HStack, Text } from "@chakra-ui/react";
import type { TransactionType } from "@ironfish/sdk";

import { MaybeLink } from "@/ui/ChakraLink/ChakraLink";
import { COLORS } from "@/ui/colors";
import { ShadowCard } from "@/ui/ShadowCard/ShadowCard";
import { formatDate } from "@/utils/formatDate";
import { hexToUTF16String } from "@/utils/hexToUTF16String";
import { formatOre } from "@/utils/ironUtils";
import { truncateString } from "@/utils/truncateString";

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
  linkToTransaction,
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
  linkToTransaction?: boolean;
}) {
  return (
    <MaybeLink
      href={
        linkToTransaction
          ? `/accounts/${accountName}/transaction/${transactionHash}`
          : undefined
      }
      w="100%"
    >
      <ShadowCard
        hoverable={linkToTransaction}
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
            md: linkToTransaction ? `repeat(5, 1fr) 55px` : `repeat(5, 1fr)`,
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
              {formatOre(value)} {hexToUTF16String(assetName)}
            </Text>
          </GridItem>
          <GridItem display="flex" alignItems="center">
            <Text as="span">{truncateString(type === "send" ? to : from)}</Text>
          </GridItem>
          <GridItem display="flex" alignItems="center">
            <Text as="span">{formatDate(timestamp)}</Text>
          </GridItem>
          <GridItem display="flex" alignItems="center">
            <Text as="span">{memo || "—"}</Text>
          </GridItem>
          {linkToTransaction && (
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
          )}
        </Grid>
      </ShadowCard>
    </MaybeLink>
  );
}
