import { Box } from "@chakra-ui/react";

export function DraggableArea() {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      w="100%"
      h="env(titlebar-area-height, 30px)"
      zIndex={9999}
      sx={{
        WebkitUserSelect: "none",
        WebkitAppRegion: "drag",
      }}
    />
  );
}
