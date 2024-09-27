import { Box, HStack, Heading, Text, VStack } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

import { AddAccountDropdown } from "@/components/AddAccountDropdown/AddAccountDropdown";
import { UserAccountsList } from "@/components/UserAccountsList/UserAccountsList";
import MainLayout from "@/layouts/MainLayout";
import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { formatOre } from "@/utils/ironUtils";

const messages = defineMessages({
  accountsHeader: {
    defaultMessage: "Accounts",
  },
  switchNetworks: {
    defaultMessage: "Switch networks",
  },
  totalAccountsBalance: {
    defaultMessage: "Total accounts balance",
  },
});

export default function Accounts() {
  const { data } = trpcReact.getAccounts.useQuery();

  const totalBalance =
    data?.reduce((acc, curr) => {
      return acc + parseInt(curr.balances.iron.confirmed);
    }, 0) ?? null;

  const { formatMessage } = useIntl();

  return (
    <MainLayout>
      <HStack alignItems="start" justifyContent="space-between" mb={10}>
        <VStack gap={0} alignItems="stretch">
          <Heading fontSize={28} flexGrow={1} lineHeight="160%">
            {formatMessage(messages.accountsHeader)}
          </Heading>
          <Box>
            <Text
              fontSize="md"
              as="span"
              color={COLORS.GRAY_MEDIUM}
              _dark={{ color: COLORS.GRAY_MEDIUM }}
              mr={1}
            >
              {formatMessage(messages.totalAccountsBalance)}:{" "}
            </Text>
            <Text fontSize="md" as="span" fontWeight="bold">
              {totalBalance !== null ? formatOre(totalBalance) : "—"} $IRON
            </Text>
          </Box>
        </VStack>
        <AddAccountDropdown />
      </HStack>

      <UserAccountsList />
    </MainLayout>
  );
}
