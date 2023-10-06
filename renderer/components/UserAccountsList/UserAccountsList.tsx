import { SearchIcon } from "@chakra-ui/icons";
import {
  VStack,
  HStack,
  InputGroup,
  InputLeftElement,
  Input,
} from "@chakra-ui/react";
import { useState } from "react";

import { trpcReact } from "@/providers/TRPCProvider";
import { gradientOptions } from "@/ui/ShadowCard/ShadowCard";

import { AccountRow } from "../AccountRow/AccountRow";

export function UserAccountsList() {
  const [searchInput, setSearchInput] = useState("");
  const { data } = trpcReact.getAccounts.useQuery();

  return (
    <VStack>
      <HStack w="100%" mb={4}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="black" _dark={{ color: "white" }} />
          </InputLeftElement>
          <Input
            type="text"
            placeholder="Search"
            borderColor="black"
            onChange={(e) => setSearchInput(e.target.value)}
            _dark={{ borderColor: "white" }}
          />
        </InputGroup>
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
              balance={parseInt(account.balances[0].confirmed) / 100000000}
              address={account.address}
            />
          );
        })}
    </VStack>
  );
}
