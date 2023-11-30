import { Box, useColorModeValue } from "@chakra-ui/react";

export function DraggableArea() {
  const bg = useColorModeValue("#ffffff", "#111111");

  return (
    <Box
      bg={bg}
      position="fixed"
      top="0"
      left="0"
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
