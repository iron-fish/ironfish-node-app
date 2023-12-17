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
import { FormattedMessage } from "react-intl";

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
import { asQueryString } from "@/utils/parseRouteQuery";

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
        label: "Back to All Accounts",
      }}
    >
      <Box>
        <HStack mb={4} gap={4}>
          <Heading>{accountData.name}</Heading>
          {accountData.status.viewOnly && (
            <Box transform="translateY(0.25em)">
              <ViewOnlyChip />
            </Box>
          )}
          <CopyAddress
            address={accountData.address}
            transform="translateY(0.4em)"
          />
        </HStack>
        <Tabs isLazy defaultIndex={initialTabIndex}>
          <TabList mb={8}>
            <Tab py={2} px={4} mr={4}>
              Account Overview
            </Tab>
            <Tab py={2} px={4} mr={4}>
              Keys
            </Tab>
            <Tab py={2} px={4} mr={4}>
              Settings
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <AccountAssets accountName={accountName} />
              <NotesList
                linkToTransaction
                notes={transactionsData}
                heading="Transaction Activity"
              />
            </TabPanel>
            <TabPanel p={0}>
              <WithExplanatorySidebar
                heading={<FormattedMessage defaultMessage="Keys" />}
                description={
                  <WithExplanatorySidebar.Description>
                    <FormattedMessage defaultMessage="Keep your keys safe by only revealing their contents when you're sure nobody is peering. These are used to access your accounts and are the primary security measure against non-solicited user access." />
                    <FormattedMessage defaultMessage="Safeguarding your mnemonic phrase and encoded keys is essential to maintain full ownership, control, and security over your digital assets." />
                  </WithExplanatorySidebar.Description>
                }
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
                heading={<FormattedMessage defaultMessage="Settings" />}
                description={
                  <WithExplanatorySidebar.Description>
                    <FormattedMessage defaultMessage="You can remove and reimport your accounts at your convenience, provided that you possess the necessary account keys. To ensure a seamless experience, it is highly recommended to maintain a backup of your account keys in a secure location." />
                  </WithExplanatorySidebar.Description>
                }
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
