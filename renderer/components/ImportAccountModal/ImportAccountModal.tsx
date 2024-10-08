import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Box,
  Modal,
  ModalCloseButton,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Heading,
} from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { defineMessages, useIntl } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";
import { useIFToast } from "@/ui/Toast/Toast";

import { EncodedKeyImport } from "./EncodedKeyImport";
import { FileImport } from "./FileImport";
import { MnemonicImport } from "./MnemonicImport";

const messages = defineMessages({
  successMessage: {
    defaultMessage: "Your account was successfully imported",
  },
  mnemonicPhrase: {
    defaultMessage: "Mnemonic Phrase",
  },
  encodedKey: {
    defaultMessage: "Encoded Key",
  },
  file: {
    defaultMessage: "File",
  },
  importAccount: {
    defaultMessage: "Import Account",
  },
});

function useTabsComponents() {
  const { formatMessage } = useIntl();

  return useMemo(
    () => [
      {
        label: formatMessage(messages.mnemonicPhrase),
        Component: MnemonicImport,
      },
      {
        label: formatMessage(messages.encodedKey),
        Component: EncodedKeyImport,
      },
      {
        label: formatMessage(messages.file),
        Component: FileImport,
      },
    ],
    [formatMessage],
  );
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function ImportAccountModal({ isOpen, onClose }: Props) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);
  const toast = useIFToast();
  const { formatMessage } = useIntl();

  const [activeTab, setActiveTab] = useState(0);

  const {
    mutate: importAccount,
    isLoading,
    error,
    reset,
  } = trpcReact.importAccount.useMutation({
    onSuccess: () => {
      toast({
        message: formatMessage(messages.successMessage),
        duration: 5000,
      });
      onClose();
    },
  });

  const tabsComponents = useTabsComponents();

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="700px">
        <ModalCloseButton />
        <ModalBody px={16} pt={16} pb={8}>
          <Heading fontSize="2xl" mb={4}>
            {formatMessage(messages.importAccount)}
          </Heading>
          <Box>
            <Tabs
              isLazy
              index={activeTab}
              onChange={(index) => {
                reset();
                setActiveTab(index);
              }}
            >
              <TabList mb={8}>
                {tabsComponents.map(({ label }, i) => (
                  <Tab key={i}>{label}</Tab>
                ))}
              </TabList>

              <TabPanels>
                {tabsComponents.map(({ Component }, i) => (
                  <TabPanel p={0} key={i}>
                    <Component
                      isLoading={isLoading}
                      error={error?.shape?.message}
                      onImport={({ name, account }) => {
                        importAccount({
                          name,
                          account,
                        });
                      }}
                      onCancel={onClose}
                    />
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
