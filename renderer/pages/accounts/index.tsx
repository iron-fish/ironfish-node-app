import {
  Box,
  HStack,
  Heading,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";

import { CreateAccountModal } from "@/components/CreateAccountModal/CreateAccountModal";
import { ImportAccountModal } from "@/components/ImportAccountModal/ImportAccountModal";
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

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();

  const {
    isOpen: isImportOpen,
    onOpen: onImportOpen,
    onClose: onImportClose,
  } = useDisclosure();

  return (
    <>
      <MainLayout>
        <VStack mb={10} alignItems="stretch">
          <HStack>
            <Heading flexGrow={1}>Accounts</Heading>
            <HStack>
              <PillButton variant="inverted" onClick={onCreateOpen}>
                <CreateAccount />
                <FormattedMessage defaultMessage="Create Account" />
              </PillButton>
              <PillButton variant="inverted" onClick={onImportOpen}>
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
      <CreateAccountModal isOpen={isCreateOpen} onClose={onCreateClose} />
      <ImportAccountModal isOpen={isImportOpen} onClose={onImportClose} />
    </>
  );
}
