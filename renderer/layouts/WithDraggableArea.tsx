import { Grid, GridItem, Box, GridProps } from "@chakra-ui/react";

export function WithDraggableArea({ children, ...rest }: GridProps) {
  const draggableAreaHeight = "env(titlebar-area-height, 30px)";
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
