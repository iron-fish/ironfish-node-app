import { Box, Heading } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import {
  TransactionRow,
  TransactionsHeadings,
} from "@/components/TransactionRow/TransactionRow";

import { TransactionNote } from "../../../shared/types";
import { EmptyStateMessage } from "../EmptyStateMessage/EmptyStateMessage";

const messages = defineMessages({
  emptyStateHeading: {
    defaultMessage: "You don't have any transactions",
  },
  emptyStateDescription: {
    defaultMessage:
      "All your transactions, whether in $IRON or other custom assets, will be displayed in this section. To start a transaction, simply click on the 'Send' or 'Receive' tabs.",
  },
});

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
  const { formatMessage } = useIntl();

  if (notes.length === 0) {
    return (
      <EmptyStateMessage
        py={8}
        heading={formatMessage(messages.emptyStateHeading)}
        description={formatMessage(messages.emptyStateDescription)}
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
