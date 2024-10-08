import {
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { useState } from "react";
import { defineMessages, useIntl } from "react-intl";

import { TRPCRouterOutputs, trpcReact } from "@/providers/TRPCProvider";
import { getAddressGradientColor } from "@/utils/gradientUtils";
import { parseOre } from "@/utils/ironUtils";

import { AccountRow } from "../AccountRow/AccountRow";
import { DropdownTrigger } from "../DropdownTrigger/DropdownTrigger";
import { NoAccountsMessage } from "../EmptyStateMessage/shared/NoAccountsMessage";
import { SearchInput } from "../SearchInput/SearchInput";
import { ChainSyncingMessage } from "../SyncingMessages/SyncingMessages";

const messages = defineMessages({
  sortBy: {
    defaultMessage: "Sort by",
  },
  accountName: {
    defaultMessage: "Account name — A to Z",
  },
  accountNameDesc: {
    defaultMessage: "Account name — Z to A",
  },
  highestToLowest: {
    defaultMessage: "Highest to lowest balance",
  },
  lowestToHighest: {
    defaultMessage: "Lowest to highest balance",
  },
});

type IntlMessages = typeof messages;

type AccountType = TRPCRouterOutputs["getAccounts"][number];

type SortOption = {
  label: IntlMessages[keyof IntlMessages];
  sort: (a: AccountType, b: AccountType) => number;
};

const sortOptions: Array<SortOption> = [
  {
    label: messages.accountName,
    sort: (a: AccountType, b: AccountType) => {
      return a.name.localeCompare(b.name);
    },
  },
  {
    label: messages.accountNameDesc,
    sort: (a: AccountType, b: AccountType) => {
      return b.name.localeCompare(a.name);
    },
  },
  {
    label: messages.highestToLowest,
    sort: (a: AccountType, b: AccountType) => {
      return (
        parseOre(b.balances.iron.confirmed) -
        parseOre(a.balances.iron.confirmed)
      );
    },
  },
  {
    label: messages.lowestToHighest,
    sort: (a: AccountType, b: AccountType) => {
      return (
        parseOre(a.balances.iron.confirmed) -
        parseOre(b.balances.iron.confirmed)
      );
    },
  },
];

export function UserAccountsList() {
  const { formatMessage } = useIntl();
  const [searchInput, setSearchInput] = useState("");
  const { data: accountsData } = trpcReact.getAccounts.useQuery();
  const { data: nodeStatusData } = trpcReact.getStatus.useQuery(undefined, {
    refetchInterval: 5000,
  });
  const [sortOption, setSortOption] = useState<SortOption>(sortOptions[2]);

  return (
    <VStack gap={4}>
      {nodeStatusData?.blockchain.synced === false ? (
        <ChainSyncingMessage mb={4} />
      ) : null}
      <Grid w="100%" templateColumns="3fr 1fr" gap={4}>
        <GridItem>
          <SearchInput onChange={(e) => setSearchInput(e.target.value)} />
        </GridItem>
        <GridItem>
          <Menu>
            <MenuButton
              as={DropdownTrigger}
              label={formatMessage(messages.sortBy)}
              value={formatMessage(sortOption.label)}
            />
            <MenuList>
              {sortOptions.map((option, i) => (
                <MenuItem
                  key={i}
                  onClick={() => {
                    setSortOption(option);
                  }}
                >
                  {formatMessage(option.label)}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </GridItem>
      </Grid>
      {/* You can reach the empty state by starting from a clean data dir, creating an account
          through onboarding, then deleting it. */}
      {accountsData && accountsData.length === 0 && <NoAccountsMessage />}
      {accountsData
        ?.filter((item) => {
          return item.name.toLowerCase().includes(searchInput.toLowerCase());
        })
        .toSorted(sortOption.sort)
        .map((account) => {
          return (
            <AccountRow
              key={account.name}
              color={getAddressGradientColor(account.address)}
              name={account.name}
              balance={account.balances.iron.confirmed}
              address={account.address}
              viewOnly={account.status.viewOnly}
              isLedger={account.isLedger}
              numOfCustomAssets={account.balances.custom.length}
            />
          );
        })}
    </VStack>
  );
}
