import { HStack, Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";

import { CopyAddress } from "@/components/CopyAddress/CopyAddress";
import MainLayout from "@/layouts/MainLayout";
import { trpcReact } from "@/providers/TRPCProvider";
import { asQueryString } from "@/utils/parseRouteQuery";

export function SingleTransactionContent({
  accountName,
  transactionHash,
}: {
  accountName: string;
  transactionHash: string;
}) {
  const { data: accountData } = trpcReact.getAccount.useQuery({
    name: accountName,
  });

  const { data: transactionData, ...rest } = trpcReact.getTransaction.useQuery({
    transactionHash,
  });

  if (!accountData) {
    return null;
  }

  console.log(transactionData, transactionHash, { ...rest });

  return (
    <MainLayout
      backLinkProps={{
        href: `/accounts/${accountName}`,
        label: "Back to Account Overview",
      }}
    >
      <HStack mb={4} gap={4}>
        <Heading>{accountName}</Heading>
        <CopyAddress
          address={accountData.address}
          transform="translateY(0.4em)"
        />
      </HStack>
      <Heading as="h3" fontSize="2xl">
        Transaction Information
      </Heading>
      <Text>{accountName}</Text>
      <Text>{transactionHash}</Text>
    </MainLayout>
  );
}

export default function SingleTransaction() {
  const router = useRouter();
  const accountName = asQueryString(router.query["account-name"]);
  const transactionHash = asQueryString(router.query["transaction-hash"]);

  if (!accountName || !transactionHash) {
    return null;
  }

  return (
    <SingleTransactionContent
      accountName={accountName}
      transactionHash={transactionHash}
    />
  );
}
