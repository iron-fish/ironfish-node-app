import { Box, Heading, Skeleton } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";
import { Virtuoso } from "react-virtuoso";

import {
  TransactionRow,
  TransactionsHeadings,
} from "@/components/TransactionRow/TransactionRow";
import { useScrollElementContext } from "@/layouts/MainLayout";

import { TransactionNote } from "../../../shared/types";
import { EmptyStateMessage } from "../EmptyStateMessage/EmptyStateMessage";

const messages = defineMessages({
  errorStateHeading: {
    defaultMessage: "Unable to load your transactions",
  },
  errorStateDescription: {
    defaultMessage:
      "An error occurred while loading your transactions. If this happens several times, please let us know on Discord.",
  },
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
  isError?: boolean;
  isLoading?: boolean;
};

export function NotesList({
  notes,
  heading = "Transaction Notes",
  linkToTransaction = false,
  isError,
  isLoading,
}: Props) {
  const { formatMessage } = useIntl();
  const customScrollElement = useScrollElementContext();

  if (isError) {
    return (
      <EmptyStateMessage
        py={8}
        heading={formatMessage(messages.errorStateHeading)}
        description={formatMessage(messages.errorStateDescription)}
      />
    );
  }

  if (!isLoading && notes.length === 0) {
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
      {isLoading && <Skeleton height="600px" />}
      {!isLoading && customScrollElement && (
        <Virtuoso
          customScrollParent={customScrollElement}
          data={notes}
          itemContent={(_, note) => {
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
          }}
        />
      )}
    </Box>
  );
}
