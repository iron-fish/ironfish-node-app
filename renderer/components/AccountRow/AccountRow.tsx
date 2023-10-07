import { ChevronRightIcon, CopyIcon } from "@chakra-ui/icons";
import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react";
import { useCopyToClipboard } from "usehooks-ts";

import { ChakraLink } from "@/ui/ChakraLink/ChakraLink";
import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";
import { ShadowCard, type GradientOptions } from "@/ui/ShadowCard/ShadowCard";
import { ArrowReceive } from "@/ui/SVGs/ArrowReceive";
import { ArrowSend } from "@/ui/SVGs/ArrowSend";
import { LogoSm } from "@/ui/SVGs/LogoSm";
import { formatAddress } from "@/utils/addressUtils";
import { formatOre } from "@/utils/ironUtils";

type AccountRowProps = {
  color: GradientOptions;
  name: string;
  balance: string;
  address: string;
};

export function AccountRow({ color, name, balance, address }: AccountRowProps) {
  const [_, copyToClipboard] = useCopyToClipboard();
  return (
    <ChakraLink href={`/accounts/${name}`} w="100%">
      <ShadowCard hoverable>
        <Flex>
          <ShadowCard
            h="110px"
            w="110px"
            gradient={color || "pink"}
            mr={8}
            position="relative"
          >
            <Flex
              position="absolute"
              inset={0}
              justifyContent="center"
              alignItems="center"
            >
              <Box transform="scale(1.5)" color="black">
                <LogoSm />
              </Box>
            </Flex>
          </ShadowCard>
          <VStack alignItems="flex-start" justifyContent="center" flexGrow={1}>
            <Text as="h3">{name}</Text>
            <Heading as="span" fontWeight="regular" fontSize="2xl">
              {formatOre(balance)} $IRON
            </Heading>
            <Text
              as="button"
              onClick={() => copyToClipboard(address)}
              color={COLORS.GRAY_MEDIUM}
              _hover={{
                textDecoration: "underline",
              }}
              _dark={{
                color: COLORS.DARK_MODE.GRAY_LIGHT,
              }}
            >
              {formatAddress(address)}
              <CopyIcon ml={1} transform="translateY(-1px)" />
            </Text>
          </VStack>

          <VStack alignItems="stretch" justifyContent="center">
            <PillButton onClick={(e) => e.preventDefault()}>
              <ArrowSend transform="scale(0.8)" />
              Send
            </PillButton>
            <PillButton onClick={(e) => e.preventDefault()}>
              <ArrowReceive transform="scale(0.8)" />
              Receive
            </PillButton>
          </VStack>

          <VStack pl={8} pr={4} justifyContent="center">
            <ChevronRightIcon
              boxSize={5}
              color={COLORS.GRAY_MEDIUM}
              _dark={{ color: COLORS.DARK_MODE.GRAY_LIGHT }}
            />
          </VStack>
        </Flex>
      </ShadowCard>
    </ChakraLink>
  );
}
