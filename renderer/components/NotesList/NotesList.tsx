import { Box, Heading } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";

import {
  TransactionRow,
  TransactionsHeadings,
} from "@/components/TransactionRow/TransactionRow";

import { TransactionNote } from "../../../shared/types";
import { EmptyStateMessage } from "../EmptyStateMessage/EmptyStateMessage";

type Props = {
  notes: TransactionNote[];
  heading?: string;
  linkToTransaction?: boolean;
};

export function NotesList({
  notes,
  heading = "Transaction Notes",
  linkToTransaction = false,
}: Props) {
  if (notes.length === 0) {
    return (
      <EmptyStateMessage
        py={8}
        heading={
          <FormattedMessage defaultMessage="You don't have any transactions" />
        }
        description={
          <FormattedMessage defaultMessage="All your transactions, whether in $IRON or other custom assets, will be displayed in this section. To start a transaction, simply click on the 'Send' or 'Receive' tabs." />
        }
      />
    );
  }
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
            accountName={note.accountName}
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
