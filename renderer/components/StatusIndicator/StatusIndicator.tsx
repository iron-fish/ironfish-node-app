import { Box, Flex, Text } from "@chakra-ui/react";
import { IoMdCheckmark } from "react-icons/io";

import { COLORS } from "@/ui/colors";
import { useSyncStatus } from "@/utils/useSyncStatus";

export function StatusIndicator() {
  const { status, label } = useSyncStatus();

  return (
    <Flex
      as="span"
      bg={status === "SYNCED" ? COLORS.GREEN_LIGHT : COLORS.YELLOW_LIGHT}
      borderRadius={4}
      color={status === "SYNCED" ? COLORS.GREEN_DARK : COLORS.YELLOW_DARK}
      justifyContent="center"
      my={4}
      py={3}
      textAlign="center"
      _dark={{
        bg:
          status === "SYNCED"
            ? COLORS.DARK_MODE.GREEN_DARK
            : COLORS.DARK_MODE.YELLOW_DARK,
        color:
          status === "SYNCED"
            ? COLORS.DARK_MODE.GREEN_LIGHT
            : COLORS.DARK_MODE.YELLOW_LIGHT,
      }}
    >
      <Text
        as="span"
        color="inherit"
        display={{
          base: "none",
          sm: "block",
        }}
      >
        Node Status: {label}
      </Text>
      <Box
        display={{
          base: "block",
          sm: "none",
        }}
      >
        <IoMdCheckmark size="1.25em" />
      </Box>
    </Flex>
  );
}
