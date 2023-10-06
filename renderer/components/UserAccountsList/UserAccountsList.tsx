import { VStack } from "@chakra-ui/react";

import { trpcReact } from "@/providers/TRPCProvider";
import { gradientOptions } from "@/ui/ShadowCard/ShadowCard";

import { AccountRow } from "../AccountRow/AccountRow";

export function UserAccountsList() {
  const { data } = trpcReact.getAccounts.useQuery();

  console.log(data);

  return (
    <VStack>
      {data?.map((account, i) => {
        return (
          <AccountRow
            key={i}
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
