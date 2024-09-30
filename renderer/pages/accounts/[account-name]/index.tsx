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
  Spinner,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ReactNode, useMemo } from "react";
import { defineMessages, useIntl } from "react-intl";

import { AccountAssets } from "@/components/AccountAssets/AccountAssets";
import { AccountKeyExport } from "@/components/AccountKeyExport/AccountKeyExport";
import { AccountMnemonicView } from "@/components/AccountMnemonicView/AccountMnenomicView";
import { AccountSettings } from "@/components/AccountSettings/AccountSettings";
import { CopyAddress } from "@/components/CopyAddress/CopyAddress";
import { LedgerChip } from "@/components/LedgerChip/LedgerChip";
import { NotesList } from "@/components/NotesList/NotesList";
import { ViewOnlyChip } from "@/components/ViewOnlyChip/ViewOnlyChip";
import keysGhost from "@/images/keys-ghost.svg";
import lionfishLock from "@/images/lionfish-lock.svg";
import MainLayout from "@/layouts/MainLayout";
import { WithExplanatorySidebar } from "@/layouts/WithExplanatorySidebar";
import { trpcReact } from "@/providers/TRPCProvider";
import { asQueryString } from "@/utils/parseRouteQuery";

const messages = defineMessages({
  previousButton: {
    defaultMessage: "Previous",
  },
  nextButton: {
    defaultMessage: "Next",
  },
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

  const { data: accountData } = trpcReact.getAccount.useQuery({
    name: accountName,
  });

  const {
    data: transactionsData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = trpcReact.getTransactions.useInfiniteQuery(
    {
      accountName,
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
    },
  );

  const notes = useMemo(() => {
    return transactionsData?.pages.flatMap((page) => page.transactions) ?? [];
  }, [transactionsData?.pages]);

  const headingChip = useMemo(() => {
    let chip: ReactNode = null;
    if (accountData?.isLedger) {
      chip = <LedgerChip />;
    } else if (accountData?.status.viewOnly) {
      chip = <ViewOnlyChip />;
    }

    return chip;
  }, [accountData?.isLedger, accountData?.status.viewOnly]);

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
          <HStack alignItems="center" gap={3}>
            <Heading fontSize="28px">{accountData.name}</Heading>
            {headingChip}
          </HStack>
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
                notes={notes}
                heading={formatMessage(messages.accountOverview)}
                onEndReached={() => {
                  if (!hasNextPage || isFetchingNextPage) return;
                  fetchNextPage();
                }}
              />
              <HStack alignItems="center" justifyContent="center" h="50px">
                {isFetchingNextPage && <Spinner opacity="0.5" />}
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
