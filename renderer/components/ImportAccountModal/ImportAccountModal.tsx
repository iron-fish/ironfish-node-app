import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Heading,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useMemo, useState } from "react";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";

import { EncodedKeyImport } from "./EncodedKeyImport";
import { FileImport } from "./FileImport";
import { MnemonicImport } from "./MnemonicImport";

const messages = defineMessages({
  successTitle: {
    defaultMessage: "Account imported",
  },
  successDescription: {
    defaultMessage: "Your account was successfully imported",
  },
});

function useTabsComponents() {
  return useMemo(
    () => [
      {
        label: <FormattedMessage defaultMessage="Mnemonic Phrase" />,
        Component: MnemonicImport,
      },
      {
        label: <FormattedMessage defaultMessage="Encoded Key" />,
        Component: EncodedKeyImport,
      },
      {
        label: <FormattedMessage defaultMessage="File" />,
        Component: FileImport,
      },
    ],
    [],
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
  const toast = useToast();
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
        title: formatMessage(messages.successTitle),
        description: formatMessage(messages.successDescription),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onClose();
    },
  });

  const tabsComponents = useTabsComponents();

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="700px">
        <ModalBody px={16} pt={16} pb={8}>
          <Heading fontSize="2xl" mb={4}>
            <FormattedMessage defaultMessage="Import Account" />
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
                  <Tab py={2} px={4} mr={4} key={i}>
                    {label}
                  </Tab>
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
