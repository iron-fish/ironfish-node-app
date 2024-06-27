import {
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  Text,
} from "@chakra-ui/react";
import Image from "next/image";

import { ConnectLedgerModal } from "@/components/ConnectLedgerModal/ConnectLedgerModal";
import { CreateAccountModal } from "@/components/CreateAccountModal/CreateAccountModal";
import { ImportAccountModal } from "@/components/ImportAccountModal/ImportAccountModal";
import { useFeatureFlags } from "@/providers/FeatureFlagsProvider";
import { PillButton } from "@/ui/PillButton/PillButton";

import createIcon from "./icons/create.svg";
import importIcon from "./icons/import.svg";
import ledgerIcon from "./icons/ledger.svg";

export function AddAccountDropdown() {
  const { flags } = useFeatureFlags();

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
          Add Account
        </MenuButton>
        <MenuList>
          <MenuItem onClick={onCreateOpen}>
            <HStack gap={3}>
              <Image src={createIcon} alt="" />
              <Text fontSize="md">Create new account</Text>
            </HStack>
          </MenuItem>
          <MenuItem onClick={onImportOpen}>
            <HStack gap={3}>
              <Image src={importIcon} alt="" />
              <Text fontSize="md">Import account</Text>
            </HStack>
          </MenuItem>
          {flags.ledgerSupport.enabled && (
            <MenuItem onClick={onLedgerOpen}>
              <HStack gap={3}>
                <Image src={ledgerIcon} alt="" />
                <Text fontSize="md">Connect Ledger</Text>
              </HStack>
            </MenuItem>
          )}
        </MenuList>
      </Menu>
      <CreateAccountModal isOpen={isCreateOpen} onClose={onCreateClose} />
      <ImportAccountModal isOpen={isImportOpen} onClose={onImportClose} />
      <ConnectLedgerModal isOpen={isLedgerOpen} onClose={onLedgerClose} />
    </>
  );
}
