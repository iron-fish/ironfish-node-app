import { Box, Grid, GridItem, Heading, Text } from "@chakra-ui/react";
import type { TransactionType } from "@ironfish/sdk";

import { trpcReact } from "@/providers/TRPCProvider";
import { ChakraLink } from "@/ui/ChakraLink/ChakraLink";
import { ShadowCard } from "@/ui/ShadowCard/ShadowCard";
import { formatAddress } from "@/utils/addressUtils";
import { formatDate } from "@/utils/formatDate";
import { hexToASCIIString } from "@/utils/hexToASCIIString";
import { formatOre } from "@/utils/ironUtils";

type Props = {
  accountName: string;
};

function TransactionsHeadings() {
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

function TransactionRow({
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
        >
          <GridItem pl={8}>
            <Text as="span">{type === "send" ? "Sent" : "Received"}</Text>
          </GridItem>
          <GridItem>
            <Text as="span">
              {formatOre(value)} {hexToASCIIString(assetName)}
            </Text>
          </GridItem>
          <GridItem>
            <Text as="span">{formatAddress(type === "send" ? to : from)}</Text>
          </GridItem>
          <GridItem>
            <Text as="span">{formatDate(timestamp)}</Text>
          </GridItem>
          <GridItem>
            <Text as="span">{memo ?? "—"}</Text>
          </GridItem>
        </Grid>
      </ShadowCard>
    </ChakraLink>
  );
}

export function TransactionsList({ accountName }: Props) {
  const { data } = trpcReact.getTransactions.useQuery({
    accountName,
  });

  if (!data) {
    return null;
  }

  return (
    <Box>
      <Heading as="h2" fontSize="2xl" mb={8}>
        Transactions
      </Heading>
      <TransactionsHeadings />
      {data.map((transaction) => {
        return (
          <TransactionRow
            key={transaction.transactionHash}
            accountName={accountName}
            assetName={transaction.assetName}
            value={transaction.value}
            timestamp={transaction.timestamp}
            from={transaction.from}
            to={transaction.to}
            transactionHash={transaction.transactionHash}
            type={transaction.type}
            memo={transaction.memo}
          />
        );
      })}
    </Box>
  );
}
