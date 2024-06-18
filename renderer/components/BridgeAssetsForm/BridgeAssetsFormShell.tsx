import { Box, Flex, HStack, VStack } from "@chakra-ui/react";
import { ReactNode } from "react";
import { defineMessages, useIntl } from "react-intl";

import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";
import { BridgeArrows } from "@/ui/SVGs/BridgeArrows";

const messages = defineMessages({
  bridgeAssetSubmit: {
    defaultMessage: "Bridge Asset",
  },
});

export function BridgeAssetsFormShell({
  status,
  fromAccountInput,
  assetAmountInput,
  bridgeProviderInput,
  destinationNetworkInput,
  targetAddressInput,
}: {
  status?: "LOADING";
  fromAccountInput: ReactNode;
  assetAmountInput: ReactNode;
  bridgeProviderInput: ReactNode;
  destinationNetworkInput: ReactNode;
  targetAddressInput: ReactNode;
}) {
  const { formatMessage } = useIntl();
  return (
    <Box>
      <VStack gap={4} alignItems="stretch">
        {fromAccountInput}
        <VStack alignItems="stretch" gap={0}>
          <VStack
            p={8}
            pb="54px"
            borderRadius={4}
            bg={COLORS.GRAY_LIGHT}
            alignItems="stretch"
            gap={4}
            _dark={{
              bg: "transparent",
              border: `1px solid ${COLORS.DARK_MODE.GRAY_MEDIUM}`,
            }}
          >
            {assetAmountInput}
            {bridgeProviderInput}
          </VStack>
          <Box my="2.5px" position="relative">
            <Flex
              bg="#F3DEF5"
              color={COLORS.ORCHID}
              border="3px solid white"
              borderRadius={4}
              alignItems="center"
              justifyContent="center"
              position="absolute"
              h="39px"
              w="42px"
              left="50%"
              top="50%"
              transform="translateX(-50%) translateY(-50%)"
              _dark={{
                borderColor: COLORS.DARK_MODE.GRAY_MEDIUM,
              }}
            >
              <BridgeArrows />
            </Flex>
          </Box>
          <VStack
            p={8}
            pt="54px"
            borderRadius={4}
            bg={COLORS.GRAY_LIGHT}
            alignItems="stretch"
            gap={4}
            _dark={{
              bg: "transparent",
              border: `1px solid ${COLORS.DARK_MODE.GRAY_MEDIUM}`,
            }}
          >
            <HStack>{destinationNetworkInput}</HStack>
            <Box>{targetAddressInput}</Box>
          </VStack>
        </VStack>
      </VStack>
      <HStack mt={8} justifyContent="flex-end">
        <PillButton type="submit" isDisabled={status === "LOADING"}>
          {formatMessage(messages.bridgeAssetSubmit)}
        </PillButton>
      </HStack>
    </Box>
  );
}
