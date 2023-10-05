import { Flex, Heading, Text, VStack } from "@chakra-ui/react";

import { trpcReact } from "@/providers/TRPCProvider";
import {
  ShadowCard,
  gradientOptions,
  type GradientOptions,
} from "@/ui/ShadowCard/ShadowCard";

function AccountRow({ color }: { color?: GradientOptions }) {
  console.log(color);
  return (
    <ShadowCard w="100%">
      <Flex>
        <ShadowCard h="110px" w="110px" gradient={color || "pink"} mr={10} />
        <VStack alignItems="flex-start" justifyContent="center" flexGrow={1}>
          <Text as="h3">Primary Account</Text>
          <Heading as="span" fontWeight="regular" fontSize="2xl">
            8,483.746901 $IRON
          </Heading>
          <Text>1234...5678...9012</Text>
        </VStack>
      </Flex>
    </ShadowCard>
  );
}

export function UserAccountsList() {
  const { data } = trpcReact.getAccounts.useQuery();

  console.log(data);

  return (
    <VStack>
      {Array.from({ length: 6 }).map((_, i) => (
        <AccountRow
          key={i}
          color={gradientOptions[i % gradientOptions.length]}
        />
      ))}
    </VStack>
  );
}
