import { Box, Heading } from "@chakra-ui/react";

import {
  TransactionRow,
  TransactionsHeadings,
} from "@/components/TransactionRow/TransactionRow";
import { trpcReact } from "@/providers/TRPCProvider";

type Props = {
  accountName: string;
};

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
        Transaction Activity
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
