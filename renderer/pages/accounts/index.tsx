import { Heading, Text, VStack } from "@chakra-ui/react";

import { UserAccountsList } from "@/components/UserAccountsList/UserAccountsList";
import MainLayout from "@/layouts/MainLayout";

export default function Accounts() {
  return (
    <MainLayout>
      <VStack mb={10} alignItems="stretch">
        <Heading>Accounts</Heading>
        <Text>Total accounts balance: 777 $IRON</Text>
      </VStack>
      <UserAccountsList />
    </MainLayout>
  );
}
