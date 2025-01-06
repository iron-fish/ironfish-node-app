import {
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  Text,
  Box,
} from "@chakra-ui/react";
import Image from "next/image";
import { defineMessages, useIntl } from "react-intl";

import { ConnectLedgerModal } from "@/components/ConnectLedgerModal/ConnectLedgerModal";
import { CreateAccountModal } from "@/components/CreateAccountModal/CreateAccountModal";
import { ImportAccountModal } from "@/components/ImportAccountModal/ImportAccountModal";
import { PillButton } from "@/ui/PillButton/PillButton";
import { CreateAccount } from "@/ui/SVGs/CreateAccount";

import createIcon from "./icons/create.svg";
import importIcon from "./icons/import.svg";
import ledgerIcon from "./icons/ledger.svg";

const messages = defineMessages({
  addAccount: {
    defaultMessage: "Add Account",
  },
  createNewAccount: {
    defaultMessage: "Create new account",
  },
  importAccount: {
    defaultMessage: "Import account",
  },
  connectLedger: {
    defaultMessage: "Connect Ledger",
  },
});

export function AddAccountDropdown() {
  const { formatMessage } = useIntl();

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

  const {
    isOpen: isLedgerOpen,
    onOpen: onLedgerOpen,
    onClose: onLedgerClose,
  } = useDisclosure();

  return (
    <>
      <Menu>
        <MenuButton as={PillButton} size="sm" variant="inverted">
          <HStack gap={2}>
            <CreateAccount />
            <Box>{formatMessage(messages.addAccount)}</Box>
          </HStack>
        </MenuButton>
        <MenuList>
          <MenuItem onClick={onCreateOpen}>
            <HStack gap={3}>
              <Image src={createIcon} alt="" />
              <Text fontSize="md">
                {formatMessage(messages.createNewAccount)}
              </Text>
            </HStack>
          </MenuItem>
          <MenuItem onClick={onImportOpen}>
            <HStack gap={3}>
              <Image src={importIcon} alt="" />
              <Text fontSize="md">{formatMessage(messages.importAccount)}</Text>
            </HStack>
          </MenuItem>
          <MenuItem onClick={onLedgerOpen}>
            <HStack gap={3}>
              <Image src={ledgerIcon} alt="" />
              <Text fontSize="md">{formatMessage(messages.connectLedger)}</Text>
            </HStack>
          </MenuItem>
        </MenuList>
      </Menu>
      {isCreateOpen && <CreateAccountModal isOpen onClose={onCreateClose} />}
      {isImportOpen && <ImportAccountModal isOpen onClose={onImportClose} />}
      {isLedgerOpen && <ConnectLedgerModal isOpen onClose={onLedgerClose} />}
    </>
  );
}
