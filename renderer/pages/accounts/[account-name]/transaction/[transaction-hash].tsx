import { Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";

import MainLayout from "@/layouts/MainLayout";
import { asQueryString } from "@/utils/parseRouteQuery";

export function SingleTransactionContent({
  accountName,
  transactionHash,
}: {
  accountName: string;
  transactionHash: string;
}) {
  return (
    <MainLayout>
      <Heading>Transaction View</Heading>
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
