import { Box, HStack, Heading, Skeleton } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { defineMessages, useIntl } from "react-intl";

import { BridgeTransactionInformation } from "@/components/BridgeTransactionInformation/BridgeTransactionInformation";
import { BridgeTransactionProgressIndicator } from "@/components/BridgeTransactionProgressIndicator/BridgeTransactionProgressIndicator";
import { CopyAddress } from "@/components/CopyAddress/CopyAddress";
import { NotesList } from "@/components/NotesList/NotesList";
import { TransactionInformation } from "@/components/TransactionInformation/TransactionInformation";
import MainLayout from "@/layouts/MainLayout";
import { trpcReact } from "@/providers/TRPCProvider";
import { asQueryString } from "@/utils/parseRouteQuery";
import { refetchTransactionUntilTerminal } from "@/utils/transactionUtils";

const messages = defineMessages({
  backToAccountOverview: {
    defaultMessage: "Back to Account Overview",
  },
  transactionNotes: {
    defaultMessage: "Transaction Notes",
  },
  change: {
    defaultMessage: "Change",
    description:
      "Change as in the money that is returned to the sender after a transaction",
  },
});

function SingleTransactionContent({
  accountName,
  transactionHash,
}: {
  accountName: string;
  transactionHash: string;
}) {
  const { formatMessage } = useIntl();

  const { data: accountData } = trpcReact.getAccount.useQuery({
    name: accountName,
  });

  const { data: transactionData } = trpcReact.getTransaction.useQuery(
    {
      accountName,
      transactionHash,
    },
    {
      refetchInterval: refetchTransactionUntilTerminal,
    },
  );

  if (!accountData) {
    return null;
  }

  if (!transactionData) {
    return (
      <MainLayout
        backLinkProps={{
          href: `/accounts/${accountName}`,
          label: formatMessage(messages.backToAccountOverview),
        }}
      >
        <HStack alignItems="baseline" mb={8} gap={4}>
          <Heading fontSize="28px">{accountName}</Heading>
          <CopyAddress address={accountData.address} />
        </HStack>
        <Skeleton height={600} />
      </MainLayout>
    );
  }

  type NoteType = (typeof transactionData.notes)[number];

  const [regularNotes, selfSendNotes] = transactionData.notes.reduce<
    [Array<NoteType>, Array<NoteType>]
  >(
    (acc, tx) => {
      const isSelfSend = tx.from === tx.to && tx.type !== "miner";

      if (!isSelfSend) {
        acc[0].push(tx);
      } else {
        acc[1].push(tx);
      }
      return acc;
    },
    [[], []],
  );

  const showSelfSendNotes = regularNotes.length > 0 && selfSendNotes.length > 0;

  return (
    <MainLayout
      backLinkProps={{
        href: `/accounts/${accountName}`,
        label: formatMessage(messages.backToAccountOverview),
      }}
    >
      <HStack alignItems="baseline" mb={8} gap={4}>
        <Heading fontSize="28px">{accountName}</Heading>
        <CopyAddress address={accountData.address} />
      </HStack>
      {transactionData.chainportData &&
        transactionData.transaction.type === "send" && (
          <BridgeTransactionProgressIndicator
            transaction={transactionData.transaction}
          />
        )}
      <TransactionInformation
        transaction={transactionData.transaction}
        mb={16}
      />
      {transactionData.chainportData && (
        <BridgeTransactionInformation
          transaction={transactionData.transaction}
          chainportData={transactionData.chainportData}
          mb={16}
        />
      )}
      <NotesList
        heading={formatMessage(messages.transactionNotes)}
        notes={showSelfSendNotes ? regularNotes : transactionData.notes}
      />
      {showSelfSendNotes && (
        <Box mt={10}>
          <NotesList
            heading={formatMessage(messages.change)}
            notes={selfSendNotes}
          />
        </Box>
      )}
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
