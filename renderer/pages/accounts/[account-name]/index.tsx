import {
  Box,
  Heading,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { defineMessages, useIntl } from "react-intl";

import { AccountAssets } from "@/components/AccountAssets/AccountAssets";
import { AccountKeyExport } from "@/components/AccountKeyExport/AccountKeyExport";
import { AccountMnemonicView } from "@/components/AccountMnemonicView/AccountMnenomicView";
import { AccountSettings } from "@/components/AccountSettings/AccountSettings";
import { CopyAddress } from "@/components/CopyAddress/CopyAddress";
import { NotesList } from "@/components/NotesList/NotesList";
import { ViewOnlyChip } from "@/components/ViewOnlyChip/ViewOnlyChip";
import keysGhost from "@/images/keys-ghost.svg";
import lionfishLock from "@/images/lionfish-lock.svg";
import MainLayout from "@/layouts/MainLayout";
import { WithExplanatorySidebar } from "@/layouts/WithExplanatorySidebar";
import { trpcReact } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";
import { asQueryString } from "@/utils/parseRouteQuery";

const messages = defineMessages({
  backToAccounts: {
    defaultMessage: "Back to all accounts",
  },
  accountOverview: {
    defaultMessage: "Account Overview",
  },
  keys: {
    defaultMessage: "Keys",
  },
  keysDescription: {
    defaultMessage:
      "Your keys and mnemonic phrase are essential for accessing your digital assets exclusively. It's important to store them securely.",
  },
  settings: {
    defaultMessage: "Settings",
  },
  settingsDescription: {
    defaultMessage:
      "You can remove and reimport your accounts whenever you like, provided that you possess the account keys. It is highly recommended to maintain a backup of your account keys in a secure location.",
  },
});

const tabs = ["overview", "keys", "settings"];

function useInitialTabIndex() {
  const router = useRouter();
  const initialTab = asQueryString(router.query["tab"]);

  if (!initialTab) return undefined;

  const initialTabIndex = tabs.indexOf(initialTab);

  return initialTabIndex !== -1 ? initialTabIndex : undefined;
}

function AccountOverviewContent({ accountName }: { accountName: string }) {
  const initialTabIndex = useInitialTabIndex();
  const { formatMessage } = useIntl();

  const [cursor, setCursor] = useState(0);

  const { data: accountData } = trpcReact.getAccount.useQuery({
    name: accountName,
  });

  const {
    data: transactionsData,
    isLoading,
    isError,
  } = trpcReact.getTransactions.useQuery({
    accountName,
    cursor,
    limit: 10,
  });

  if (!accountData) {
    // @todo: Error handling
    return null;
  }

  return (
    <MainLayout
      backLinkProps={{
        href: "/accounts",
        label: formatMessage(messages.backToAccounts),
      }}
    >
      <Box>
        <VStack mb={6} gap={0} alignItems="flex-start">
          <Heading>{accountData.name}</Heading>
          {accountData.status.viewOnly && (
            <Box transform="translateY(0.25em)">
              <ViewOnlyChip />
            </Box>
          )}
          <CopyAddress
            address={accountData.address}
            truncate={false}
            transform="translateY(0.4em)"
          />
        </VStack>
        <Tabs isLazy defaultIndex={initialTabIndex}>
          <TabList mb={8}>
            <Tab>{formatMessage(messages.accountOverview)}</Tab>
            <Tab>{formatMessage(messages.keys)}</Tab>
            <Tab>{formatMessage(messages.settings)}</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <AccountAssets accountName={accountName} />
              <NotesList
                asTransactions
                isLoading={isLoading}
                isError={isError}
                notes={transactionsData?.transactions ?? []}
                heading={formatMessage(messages.accountOverview)}
              />
              <HStack flex={1} justifyContent="center">
                <PillButton
                  isDisabled={!transactionsData || cursor <= 0}
                  onClick={() => {
                    setCursor((c) => Math.max(c - 10, 0));
                  }}
                >
                  Previous
                </PillButton>
                <PillButton
                  isDisabled={!transactionsData?.hasNextPage}
                  onClick={() => {
                    setCursor((c) => c + 10);
                  }}
                >
                  Next
                </PillButton>
              </HStack>
            </TabPanel>
            <TabPanel p={0}>
              <WithExplanatorySidebar
                heading={formatMessage(messages.keys)}
                description={formatMessage(messages.keysDescription)}
                imgSrc={keysGhost}
              >
                <VStack gap={8} alignItems="stretch">
                  {!accountData.status.viewOnly && (
                    <AccountMnemonicView accountName={accountName} />
                  )}
                  <AccountKeyExport accountName={accountName} />
                </VStack>
              </WithExplanatorySidebar>
            </TabPanel>
            <TabPanel p={0}>
              <WithExplanatorySidebar
                heading={formatMessage(messages.settings)}
                description={formatMessage(messages.settingsDescription)}
                imgSrc={lionfishLock}
              >
                <AccountSettings accountName={accountName} />
              </WithExplanatorySidebar>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </MainLayout>
  );
}

export default function AccountOverview() {
  const router = useRouter();
  const accountName = asQueryString(router.query["account-name"]);

  if (!accountName) {
    return null;
  }

  return <AccountOverviewContent accountName={accountName} />;
}
