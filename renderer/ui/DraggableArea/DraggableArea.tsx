import { Box, useColorMode, useColorModeValue } from "@chakra-ui/react";
import { useEffect } from "react";

import { trpcReact } from "@/providers/TRPCProvider";

export function DraggableArea() {
  const { colorMode } = useColorMode();
  const bg = useColorModeValue("#ffffff", "#111111");

  const { mutate } = trpcReact.setTheme.useMutation();

  useEffect(() => {
    console.log("color", colorMode);
    mutate({ theme: colorMode });
  }, [mutate, colorMode]);

  return (
    <Box
      bg={bg}
      position="fixed"
      top="env(titlebar-area-y, 0)"
      left="env(titlebar-area-x, 0)"
      w="env(titlebar-area-width, 100%)"
      h="env(titlebar-area-height, 33px)"
      zIndex={9999}
      sx={{
        WebkitUserSelect: "none",
        WebkitAppRegion: "drag",
      }}
    />
  );
}
