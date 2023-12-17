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
import { defineMessages, useIntl } from "react-intl";

import { AccountAssets } from "@/components/AccountAssets/AccountAssets";
import { AccountKeyExport } from "@/components/AccountKeyExport/AccountKeyExport";
import { AccountMnemonicView } from "@/components/AccountMnemonicView/AccountMnenomicView";
import { AccountSettings } from "@/components/AccountSettings/AccountSettings";
import { CopyAddress } from "@/components/CopyAddress/CopyAddress";
import { NotesList } from "@/components/NotesList/NotesList";
import keysGhost from "@/images/keys-ghost.svg";
import lionfishLock from "@/images/lionfish-lock.svg";
import MainLayout from "@/layouts/MainLayout";
import { WithExplanatorySidebar } from "@/layouts/WithExplanatorySidebar";
import { trpcReact } from "@/providers/TRPCProvider";
import { asQueryString } from "@/utils/parseRouteQuery";

const messages = defineMessages({
  accountOverview: {
    defaultMessage: "Account Overview",
  },
  keys: {
    defaultMessage: "Keys",
  },
  settings: {
    defaultMessage: "Settings",
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

  const { data: accountData } = trpcReact.getAccount.useQuery({
    name: accountName,
  });

  const { data: transactionsData } = trpcReact.getTransactions.useQuery({
    accountName,
  });

  if (!accountData || !transactionsData) {
    // @todo: Error handling
    return null;
  }

  return (
    <MainLayout
      backLinkProps={{
        href: "/accounts",
        label: formatMessage(messages.accountOverview),
      }}
    >
      <Box>
        <HStack mb={4} gap={4}>
          <Heading>{accountData.name}</Heading>
          <CopyAddress
            address={accountData.address}
            transform="translateY(0.4em)"
          />
        </HStack>
        <Tabs isLazy defaultIndex={initialTabIndex}>
          <TabList mb={8}>
            <Tab py={2} px={4} mr={4}>
              {formatMessage(messages.accountOverview)}
            </Tab>
            <Tab py={2} px={4} mr={4}>
              {formatMessage(messages.keys)}
            </Tab>
            <Tab py={2} px={4} mr={4}>
              {formatMessage(messages.settings)}
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <AccountAssets accountName={accountName} />
              <NotesList
                linkToTransaction
                notes={transactionsData}
                heading={formatMessage(messages.accountOverview)}
              />
            </TabPanel>
            <TabPanel p={0}>
              <WithExplanatorySidebar
                heading={formatMessage(messages.keys)}
                description={formatMessage(messages.keys)}
                imgSrc={keysGhost}
              >
                <VStack gap={8} alignItems="stretch">
                  <AccountMnemonicView accountName={accountName} />
                  <AccountKeyExport accountName={accountName} />
                </VStack>
              </WithExplanatorySidebar>
            </TabPanel>
            <TabPanel p={0}>
              <WithExplanatorySidebar
                heading={formatMessage(messages.settings)}
                description={formatMessage(messages.settings)}
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
