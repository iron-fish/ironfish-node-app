import { Grid, GridItem, Box, GridProps } from "@chakra-ui/react";

const draggableAreaHeight = "env(titlebar-area-height, 30px)";

export function WithDraggableArea({ children, ...rest }: GridProps) {
  return (
    <Grid {...rest} height="100vh">
      <GridItem>
        <Box
          height={draggableAreaHeight}
          sx={{
            WebkitUserSelect: "none",
            WebkitAppRegion: "drag",
          }}
        />
      </GridItem>
      <GridItem height={`calc(100vh - ${draggableAreaHeight})`}>
        {children}
      </GridItem>
    </Grid>
  );
}
