import { Grid, GridItem, Text } from "@chakra-ui/react";

import { CARET_WIDTH, useHeadingsText } from "./shared";

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
