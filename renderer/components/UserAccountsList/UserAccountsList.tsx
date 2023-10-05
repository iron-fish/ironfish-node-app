import { Flex, Heading, Text, VStack } from "@chakra-ui/react";

import { ShadowCard } from "@/ui/ShadowCard/ShadowCard";

function AccountRow() {
  return (
    <ShadowCard w="100%">
      <Flex>
        <ShadowCard h="110px" w="110px" gradient="pink" mr={10} />
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
  return (
    <VStack>
      <AccountRow />
      <AccountRow />
      <AccountRow />
      <AccountRow />
    </VStack>
  );
}
