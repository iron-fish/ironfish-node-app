import { Box, Flex, Heading, Text, VStack } from "@chakra-ui/react";

import { ShadowCard, type GradientOptions } from "@/ui/ShadowCard/ShadowCard";
import { LogoSm } from "@/ui/SVGs/LogoSm";
import { formatAddress } from "@/utils/addressUtils";

type AccountRowProps = {
  color: GradientOptions;
  name: string;
  balance: number;
  address: string;
};

export function AccountRow({ color, name, balance, address }: AccountRowProps) {
  return (
    <ShadowCard w="100%">
      <Flex>
        <ShadowCard
          h="110px"
          w="110px"
          gradient={color || "pink"}
          mr={10}
          position="relative"
        >
          <Flex
            position="absolute"
            inset={0}
            justifyContent="center"
            alignItems="center"
          >
            <Box transform="scale(1.5)">
              <LogoSm />
            </Box>
          </Flex>
        </ShadowCard>
        <VStack alignItems="flex-start" justifyContent="center" flexGrow={1}>
          <Text as="h3">{name}</Text>
          <Heading as="span" fontWeight="regular" fontSize="2xl">
            {balance} $IRON
          </Heading>
          <Text>{formatAddress(address)}</Text>
        </VStack>
      </Flex>
    </ShadowCard>
  );
}
