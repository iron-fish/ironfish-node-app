import { Box, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";

import { UserAccountsList } from "@/components/UserAccountsList/UserAccountsList";
import MainLayout from "@/layouts/MainLayout";
import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";
import { CreateAccount } from "@/ui/SVGs/CreateAccount";
import { ImportAccount } from "@/ui/SVGs/ImportAccount";
import { formatOre } from "@/utils/ironUtils";

export default function Accounts() {
  const { data } = trpcReact.getAccounts.useQuery();

  const totalBalance =
    data?.reduce((acc, curr) => {
      return acc + parseInt(curr.balances.iron.confirmed);
    }, 0) ?? null;

  return (
    <MainLayout>
      <VStack mb={10} alignItems="stretch">
        <HStack>
          <Heading flexGrow={1}>Accounts</Heading>
          <HStack>
            <PillButton variant="inverted">
              <CreateAccount />
              <FormattedMessage defaultMessage="Create Account" />
            </PillButton>
            <PillButton variant="inverted">
              <ImportAccount />
              <FormattedMessage defaultMessage="Import Account" />
            </PillButton>
          </HStack>
        </HStack>
        <Box>
          <Text fontSize="md" as="span" color={COLORS.GRAY_MEDIUM} mr={1}>
            <FormattedMessage defaultMessage="Total accounts balance" />:{" "}
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
