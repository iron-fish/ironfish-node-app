import { Grid, GridItem, Text } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

const CARET_WIDTH = "55px";

export const headingMessages = defineMessages({
  action: {
    defaultMessage: "Action",
  },
  amount: {
    defaultMessage: "Amount",
  },
  fromTo: {
    defaultMessage: "From/To",
  },
  date: {
    defaultMessage: "Date",
  },
  memo: {
    defaultMessage: "Memo",
  },
  sent: {
    defaultMessage: "Sent",
  },
  received: {
    defaultMessage: "Received",
  },
  pending: {
    defaultMessage: "Pending",
  },
  expired: {
    defaultMessage: "Expired",
  },
  multipleRecipients: {
    defaultMessage: "Multiple recipients",
  },
  multipleMemos: {
    defaultMessage: "Multiple memos",
  },
});

export function useHeadingsText() {
  const { formatMessage } = useIntl();
  return [
    formatMessage(headingMessages.action),
    formatMessage(headingMessages.amount),
    formatMessage(headingMessages.fromTo),
    formatMessage(headingMessages.date),
    formatMessage(headingMessages.memo),
  ];
}

export function NoteHeadings() {
  const headingsText = useHeadingsText();

  return (
    <Grid
      display={{
        base: "none",
        lg: "grid",
      }}
      templateColumns={{
        base: `repeat(5, 1fr)`,
        lg: `repeat(5, 1fr) ${CARET_WIDTH}`,
      }}
      opacity="0.8"
      mb={4}
      px={8}
    >
      {headingsText.map((heading, i) => (
        <GridItem key={i}>
          <Text as="span">{heading}</Text>
        </GridItem>
      ))}
    </Grid>
  );
}
