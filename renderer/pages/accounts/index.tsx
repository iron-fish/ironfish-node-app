import { Box, Heading, Text, VStack } from "@chakra-ui/react";

import { UserAccountsList } from "@/components/UserAccountsList/UserAccountsList";
import MainLayout from "@/layouts/MainLayout";
import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { formatOre } from "@/utils/ironUtils";

export default function Accounts() {
  const { data } = trpcReact.getAccounts.useQuery();

  const totalBalance =
    data?.reduce((acc, curr) => {
      return acc + parseInt(curr.balances[0].confirmed);
    }, 0) ?? null;

  return (
    <MainLayout>
      <VStack mb={10} alignItems="stretch">
        <Heading>Accounts</Heading>
        <Box>
          <Text fontSize="md" as="span" color={COLORS.GRAY_MEDIUM} mr={1}>
            Total accounts balance:{" "}
          </Text>
          <Text fontSize="md" as="span" fontWeight="bold">
            {totalBalance !== null ? formatOre(totalBalance) : "—"} $IRON
          </Text>
        </Box>
      </VStack>
      <UserAccountsList />
    </MainLayout>
  );
}
