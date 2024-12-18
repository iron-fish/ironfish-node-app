import { Box, Heading, Skeleton } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";
import { Virtuoso } from "react-virtuoso";

import { NoteHeadings } from "@/components/NoteRow/NoteHeadings";
import { NoteRow } from "@/components/NoteRow/NoteRow";
import { useScrollElementContext } from "@/layouts/MainLayout";
import { trpcReact } from "@/providers/TRPCProvider";

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
  heading: string;
  asTransactions?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  combineTypeAndStatus?: boolean;
  onEndReached?: (index: number) => void;
};

export function NotesList({
  notes,
  heading,
  asTransactions = false,
  isError,
  isLoading,
  onEndReached,
}: Props) {
  const { formatMessage } = useIntl();
  const { data: contacts, isLoading: isContactsLoading } =
    trpcReact.getContacts.useQuery();
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

  const isNotesListLoading = isLoading || isContactsLoading;

  return (
    <Box>
      <Heading as="h2" fontSize="2xl" mb={8}>
        {heading}
      </Heading>
      <NoteHeadings asTransactions={asTransactions} />
      {isNotesListLoading && <Skeleton height="600px" />}
      {!isNotesListLoading && customScrollElement && (
        <Virtuoso
          customScrollParent={customScrollElement}
          data={notes}
          itemContent={(_, note) => {
            return (
              <NoteRow
                key={note.noteHash}
                accountName={note.accountName}
                asset={note.asset}
                assetId={note.assetId}
                value={note.value}
                timestamp={note.timestamp}
                contact={contacts?.find((contact) => {
                  return note.type === "send"
                    ? contact.address === note.to
                    : contact.address === note.from;
                })}
                from={note.from}
                to={note.to}
                transactionHash={note.transactionHash}
                type={note.type}
                status={note.status}
                memo={note.memo}
                asTransaction={asTransactions}
                isBridge={asTransactions && !!note.chainportData}
              />
            );
          }}
          endReached={onEndReached}
        />
      )}
    </Box>
  );
}
