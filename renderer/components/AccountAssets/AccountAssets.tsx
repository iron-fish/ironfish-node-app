import { Flex, Heading, HStack, LightMode, Text } from "@chakra-ui/react";

import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { ShadowCard } from "@/ui/ShadowCard/ShadowCard";
import { formatOre } from "@/utils/ironUtils";

export function AccountAssets({ accountName }: { accountName: string }) {
  const { data } = trpcReact.getAccount.useQuery({
    name: accountName,
  });

  if (!data) {
    // @todo: Error handling
    return null;
  }

  return (
    <LightMode>
      <ShadowCard
        contentContainerProps={{
          bg: COLORS.VIOLET,
          p: 8,
        }}
      >
        <Heading color={COLORS.BLACK} fontSize={24} mb={4}>
          Your Assets
        </Heading>
        <HStack bg="rgba(255, 255, 255, 0.15)" p={8} borderRadius="7px">
          <Flex alignItems="flex-start" flexDirection="column">
            <Text fontSize="md" mb={2}>
              $IRON
            </Text>
            <Heading as="span" color="black">
              {formatOre(data?.balances[0].confirmed)}
            </Heading>
          </Flex>
        </HStack>
      </ShadowCard>
    </LightMode>
  );
}
