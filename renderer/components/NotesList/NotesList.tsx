import { Box, Heading } from "@chakra-ui/react";

import {
  TransactionRow,
  TransactionsHeadings,
} from "@/components/TransactionRow/TransactionRow";

import { TransactionNote } from "../../../shared/types";

type Props = {
  accountName: string;
  notes: TransactionNote[];
  heading?: string;
  linkToTransaction?: boolean;
};

export function NotesList({
  accountName,
  notes,
  heading = "Transaction Notes",
  linkToTransaction = false,
}: Props) {
  return (
    <Box>
      <Heading as="h2" fontSize="2xl" mb={8}>
        {heading}
      </Heading>
      <TransactionsHeadings />
      {notes.map((note) => {
        return (
          <TransactionRow
            key={note.noteHash}
            accountName={accountName}
            assetName={note.assetName}
            value={note.value}
            timestamp={note.timestamp}
            from={note.from}
            to={note.to}
            transactionHash={note.transactionHash}
            type={note.type}
            memo={note.memo}
            linkToTransaction={linkToTransaction}
          />
        );
      })}
    </Box>
  );
}
