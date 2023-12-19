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
import { gradientOptions } from "@/ui/ShadowCard/ShadowCard";
import { parseOre } from "@/utils/ironUtils";

import { AccountRow } from "../AccountRow/AccountRow";
import { DropdownTrigger } from "../DropdownTrigger/DropdownTrigger";
import { SearchInput } from "../SearchInput/SearchInput";

const messages = defineMessages({
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
  const [searchInput, setSearchInput] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>(sortOptions[0]);
  const { data } = trpcReact.getAccounts.useQuery();
  const { formatMessage } = useIntl();

  return (
    <VStack>
      <Grid w="100%" templateColumns="3fr 1fr" gap={4} mb={4}>
        <GridItem>
          <SearchInput onChange={(e) => setSearchInput(e.target.value)} />
        </GridItem>
        <GridItem>
          <Menu>
            <MenuButton
              as={DropdownTrigger}
              label="Sort by"
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
      {data
        ?.filter((item) => {
          return item.name.toLowerCase().includes(searchInput.toLowerCase());
        })
        .toSorted(sortOption.sort)
        .map((account, i) => {
          return (
            <AccountRow
              key={account.address}
              color={gradientOptions[i % gradientOptions.length]}
              name={account.name}
              balance={account.balances.iron.confirmed}
              address={account.address}
            />
          );
        })}
    </VStack>
  );
}
