import {
  Box,
  Flex,
  HStack,
  Heading,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { BsThreeDots } from "react-icons/bs";
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

function CreateImportActions() {
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
      <HStack
        display={{
          base: "none",
          lg: "flex",
        }}
      >
        <PillButton size="sm" variant="inverted" onClick={onCreateOpen}>
          <CreateAccount />
          <FormattedMessage defaultMessage="Create Account" />
        </PillButton>
        <PillButton size="sm" variant="inverted" onClick={onImportOpen}>
          <ImportAccount />
          <FormattedMessage defaultMessage="Import Account" />
        </PillButton>
      </HStack>

      <Box
        display={{
          base: "flex",
          lg: "none",
        }}
      >
        <Menu>
          <MenuButton
            aria-label="Add or import account menu"
            as={Flex}
            h="48px"
            w="48px"
            borderRadius="full"
            border="1px solid"
            borderColor="currentColor"
            alignItems="center"
            textAlign="center"
          >
            <Flex as="span" justifyContent="center">
              <BsThreeDots size="1.3em" />
            </Flex>
          </MenuButton>
          <MenuList>
            <MenuItem onClick={onCreateOpen}>
              <FormattedMessage defaultMessage="Create Account" />
            </MenuItem>
            <MenuItem onClick={onImportOpen}>
              <FormattedMessage defaultMessage="Import Account" />
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>

      <CreateAccountModal isOpen={isCreateOpen} onClose={onCreateClose} />
      <ImportAccountModal isOpen={isImportOpen} onClose={onImportClose} />
    </>
  );
}

export default function Accounts() {
  const { data } = trpcReact.getAccounts.useQuery();

  const totalBalance =
    data?.reduce((acc, curr) => {
      return acc + parseInt(curr.balances.iron.confirmed);
    }, 0) ?? null;

  return (
    <>
      <MainLayout>
        <VStack mb={10} alignItems="stretch">
          <HStack>
            <Heading flexGrow={1}>Accounts</Heading>
            <CreateImportActions />
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
    </>
  );
}
