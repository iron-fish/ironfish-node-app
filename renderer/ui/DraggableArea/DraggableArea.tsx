import { Box } from "@chakra-ui/react";

export function DraggableArea() {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      w="100%"
      h="30px"
      zIndex={9999}
      sx={{
        "-webkit-user-select": "none",
        "-webkit-app-region": "drag",
      }}
    />
  );
}