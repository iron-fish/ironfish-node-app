import { VStack, HStack } from "@chakra-ui/react";
import { useState } from "react";

import { trpcReact } from "@/providers/TRPCProvider";
import { gradientOptions } from "@/ui/ShadowCard/ShadowCard";

import { AccountRow } from "../AccountRow/AccountRow";
import { SearchInput } from "../SearchInput/SearchInput";

export function UserAccountsList() {
  const [searchInput, setSearchInput] = useState("");
  const { data } = trpcReact.getAccounts.useQuery();

  return (
    <VStack>
      <HStack w="100%" mb={4}>
        <SearchInput onChange={(e) => setSearchInput(e.target.value)} />
      </HStack>
      {data
        ?.filter((item) => {
          return item.name.toLowerCase().includes(searchInput.toLowerCase());
        })
        .map((account, i) => {
          return (
            <AccountRow
              key={account.address}
              color={gradientOptions[i % gradientOptions.length]}
              name={account.name}
              balance={account.balances[0].confirmed}
              address={account.address}
            />
          );
        })}
    </VStack>
  );
}
