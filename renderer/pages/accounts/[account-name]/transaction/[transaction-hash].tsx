import { HStack, Heading, Skeleton } from "@chakra-ui/react";
import { useRouter } from "next/router";

import { CopyAddress } from "@/components/CopyAddress/CopyAddress";
import { NotesList } from "@/components/NotesList/NotesList";
import { TransactionInformation } from "@/components/TransactionInformation/TransactionInformation";
import MainLayout from "@/layouts/MainLayout";
import { trpcReact } from "@/providers/TRPCProvider";
import { asQueryString } from "@/utils/parseRouteQuery";

function SingleTransactionContent({
  accountName,
  transactionHash,
}: {
  accountName: string;
  transactionHash: string;
}) {
  const { data: accountData } = trpcReact.getAccount.useQuery({
    name: accountName,
  });

  const { data: transactionData } = trpcReact.getTransaction.useQuery({
    accountName,
    transactionHash,
  });

  if (!accountData) {
    return null;
  }

  if (!transactionData) {
    return (
      <MainLayout
        backLinkProps={{
          href: `/accounts/${accountName}`,
          label: "Back to Account Overview",
        }}
      >
        <HStack mb={8} gap={4}>
          <Heading>{accountName}</Heading>
          <CopyAddress
            address={accountData.address}
            transform="translateY(0.4em)"
          />
        </HStack>
        <Skeleton height={600} />
      </MainLayout>
    );
  }

  return (
    <MainLayout
      backLinkProps={{
        href: `/accounts/${accountName}`,
        label: "Back to Account Overview",
      }}
    >
      <HStack mb={8} gap={4}>
        <Heading>{accountName}</Heading>
        <CopyAddress
          address={accountData.address}
          transform="translateY(0.4em)"
        />
      </HStack>
      <TransactionInformation
        transaction={transactionData.transaction}
        mb={16}
      />
      <NotesList notes={transactionData.notes} />
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
