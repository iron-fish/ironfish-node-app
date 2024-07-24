import { Text, HStack } from "@chakra-ui/react";

import { COLORS } from "@/ui/colors";

export function LedgerChip() {
  return (
    <HStack
      alignItems="center"
      bg={COLORS.GRAY_LIGHT}
      color={COLORS.GRAY_MEDIUM}
      spacing={1}
      borderRadius="full"
      border="1px solid transparent"
      px="8px"
      py="2px"
      _hover={{
        borderColor: COLORS.GRAY_MEDIUM,
      }}
      _dark={{
        bg: COLORS.DARK_MODE.GRAY_DARK,
        color: COLORS.DARK_MODE.GRAY_LIGHT,
        _hover: {
          borderColor: COLORS.DARK_MODE.GRAY_LIGHT,
        },
      }}
    >
      <Text fontSize="12px">Ledger</Text>
    </HStack>
  );
}
