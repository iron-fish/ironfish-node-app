import { Tabs, TabList, Tab, TabPanels, TabPanel, Box } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";

import { EncodedKeyImport } from "./EncodedKeyImport";
import { FileImport } from "./FileImport";
import { MnemonicImport } from "./MnemonicImport";

type Props = {
  onSuccess: () => void;
};

function useTabsComponents() {
  return useMemo(
    () => [
      {
        label: <FormattedMessage defaultMessage="Mnemonic Phrase" />,
        Component: MnemonicImport,
        onStateUpdate: () => {},
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

export function ImportAccount({ onSuccess }: Props) {
  const [activeTab, setActiveTab] = useState(0);

  const {
    mutate: importAccount,
    isLoading,
    error,
    reset,
  } = trpcReact.importAccount.useMutation({
    onSuccess,
  });

  const tabsComponents = useTabsComponents();

  return (
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
              />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
}
