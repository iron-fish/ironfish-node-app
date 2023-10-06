import { Box, Heading, Text, VStack } from "@chakra-ui/react";

import { UserAccountsList } from "@/components/UserAccountsList/UserAccountsList";
import MainLayout from "@/layouts/MainLayout";
import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { parseOre } from "@/utils/ironUtils";

export default function Accounts() {
  const { data } = trpcReact.getAccounts.useQuery();

  console.log(data);

  const totalBalance =
    data?.reduce((acc, curr) => {
      const accountBalance = parseOre(curr.balances[0].confirmed);
      return acc + accountBalance;
    }, 0) ?? "—";

  return (
    <MainLayout>
      <VStack mb={10} alignItems="stretch">
        <Heading>Accounts</Heading>
        <Box>
          <Text fontSize="md" as="span" color={COLORS.GRAY_MEDIUM} mr={1}>
            Total accounts balance:{" "}
          </Text>
          <Text fontSize="md" as="span" fontWeight="bold">
            {totalBalance} $IRON
          </Text>
        </Box>
      </VStack>
      <UserAccountsList />
    </MainLayout>
  );
}
