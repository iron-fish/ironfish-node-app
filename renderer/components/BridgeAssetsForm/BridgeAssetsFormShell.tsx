import { Box, Flex, HStack, VStack, Text } from "@chakra-ui/react";
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
  topLevelErrorMessage,
}: {
  status?: "LOADING" | "PATHS_LOADING";
  fromAccountInput: ReactNode;
  assetAmountInput: ReactNode;
  bridgeProviderInput: ReactNode;
  destinationNetworkInput: ReactNode;
  targetAddressInput: ReactNode;
  topLevelErrorMessage?: string;
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
              borderRadius={8}
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
                bg: "#431848",
                color: "#D657D9",
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
      {topLevelErrorMessage && (
        <Box
          bg="#FFE5DD"
          _dark={{
            bg: "#453328",
          }}
          textAlign="center"
          py={3}
          px={4}
          mt={4}
        >
          <Text
            color={COLORS.RED}
            _dark={{
              color: COLORS.DARK_MODE.RED,
            }}
          >
            {topLevelErrorMessage}
          </Text>
        </Box>
      )}

      <HStack mt={8} justifyContent="flex-end">
        <PillButton type="submit" isDisabled={status === "LOADING"}>
          {formatMessage(messages.bridgeAssetSubmit)}
        </PillButton>
      </HStack>
    </Box>
  );
}
