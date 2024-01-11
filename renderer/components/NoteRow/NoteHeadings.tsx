import { Grid, GridItem, Text } from "@chakra-ui/react";
import { useIntl } from "react-intl";

import { messages, CARET_WIDTH } from "./shared";

export function useHeadingsText() {
  const { formatMessage } = useIntl();
  return [
    formatMessage(messages.action),
    formatMessage(messages.amount),
    formatMessage(messages.fromTo),
    formatMessage(messages.date),
    formatMessage(messages.memo),
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
