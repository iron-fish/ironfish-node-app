import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import { FormattedMessage } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";

import { EncodedKeyImport } from "./EncodedKeyImport";
import { FileImport } from "./FileImport";
import { MnemonicImport } from "./MnemonicImport";

type Props = {
  onSuccess: () => void;
};

export function ImportAccount({ onSuccess }: Props) {
  const {
    mutate: importAccount,
    isLoading,
    error,
    reset,
  } = trpcReact.importAccount.useMutation({
    onSuccess,
  });

  return (
    <Tabs isLazy onChange={reset}>
      <TabList mb={8}>
        <Tab py={2} px={4} mr={4}>
          <FormattedMessage defaultMessage="Mnemonic Phrase" />
        </Tab>
        <Tab py={2} px={4} mr={4}>
          <FormattedMessage defaultMessage="Encoded Key" />
        </Tab>
        <Tab py={2} px={4} mr={4}>
          <FormattedMessage defaultMessage="File" />
        </Tab>
      </TabList>

      <TabPanels>
        <TabPanel p={0}>
          <MnemonicImport
            isLoading={isLoading}
            error={error?.shape?.message}
            handleImport={({ name, account }) => {
              importAccount({
                name,
                account,
              });
            }}
          />
        </TabPanel>
        <TabPanel p={0}>
          <EncodedKeyImport
            isLoading={isLoading}
            error={error?.shape?.message}
            handleImport={({ account }) => {
              importAccount({
                account,
              });
            }}
          />
        </TabPanel>
        <TabPanel p={0}>
          <FileImport
            isLoading={isLoading}
            error={error?.shape?.message}
            handleImport={({ account }) => {
              importAccount({
                account,
              });
            }}
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
