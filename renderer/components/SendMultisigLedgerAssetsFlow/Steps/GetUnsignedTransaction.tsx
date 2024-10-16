import {
  Box,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { defineMessages, useIntl } from "react-intl";

import octopus from "@/images/octopus.svg";
import { WithExplanatorySidebar } from "@/layouts/WithExplanatorySidebar";
import { trpcReact } from "@/providers/TRPCProvider";
import { Select } from "@/ui/Forms/Select/Select";
import { TextareaInput } from "@/ui/Forms/TextareaInput/TextareaInput";
import { PillButton } from "@/ui/PillButton/PillButton";
import { asQueryString } from "@/utils/parseRouteQuery";

import { NoSpendingAccountsMessage } from "../../EmptyStateMessage/shared/NoSpendingAccountsMessage";
import {
  PendingTransactionData,
  SendAssetsFormContent,
} from "../../SendAssetsForm/SendAssetsForm";
import { CopyField } from "../Components/CopyField";

const messages = defineMessages({
  multisigGetUnsignedTransactionHeading: {
    defaultMessage: "Unsigned Transaction",
  },
  multisigCoordinatorGetUnsignedTransactionText: {
    defaultMessage:
      "Sending a multisig transaction starts with creating an unsigned transaction: a fully generated transaction that is only missing the signature. As the coordinator either create a new unsigned transaction or use unsigned transaction data already created in the CLI. Then send that unsigned transaction data to the participants",
  },
  multisigParticipantGetUnsignedTransactionText: {
    defaultMessage:
      "Sending a multisig transaction starts with creating an unsigned transaction: a fully generated transaction that is only missing the signature. The coordinator should create the unsigned transaction data and send it to you",
  },
});

function CreateUnsignedTransactionForm({
  onSubmit,
}: {
  onSubmit: (unsignedTransaction: string, selectedAccount: string) => void;
}) {
  const router = useRouter();
  const { data: accountsData } = trpcReact.getMultisigLedgerAccounts.useQuery();
  const defaultToAddress = asQueryString(router.query.to);

  const {
    mutate: createUnsignedTransaction,
    data: unsignedTransactionData,
    isIdle,
    isLoading,
    isError,
    isSuccess,
    error,
  } = trpcReact.handleCreateUnsignedTransaction.useMutation();

  const [pendingTransaction, setPendingTransaction] =
    useState<PendingTransactionData | null>(null);

  useEffect(() => {
    if (pendingTransaction && isIdle) {
      createUnsignedTransaction(pendingTransaction.transactionData);
    }
  }, [pendingTransaction, isIdle, createUnsignedTransaction]);

  if (!accountsData) {
    return null;
  }

  if (accountsData.length === 0) {
    return <NoSpendingAccountsMessage />;
  }

  if (pendingTransaction) {
    return (
      <>
        {isLoading && "Creating Unsigned Transaction..."}
        {isSuccess && (
          <Box>
            <CopyField
              label={"Unsigned Transaction"}
              value={unsignedTransactionData.unsignedTransaction}
            />
            <PillButton
              mt={8}
              height="60px"
              px={8}
              onClick={() => {
                onSubmit(
                  unsignedTransactionData.unsignedTransaction,
                  pendingTransaction.selectedAccount.name,
                );
              }}
            >
              Next
            </PillButton>
          </Box>
        )}
        {isError && (error?.message ?? "Unknown error")}
      </>
    );
  }

  return (
    <SendAssetsFormContent
      sendButtonText="Create Unsigned Transaction"
      onPendingChange={setPendingTransaction}
      accountsData={accountsData}
      defaultToAddress={defaultToAddress}
    />
  );
}

function InputUnsignedTransaction({
  onSubmit,
}: {
  onSubmit: (unsignedTransaction: string, selectedAccount: string) => void;
}) {
  const accounts = trpcReact.getMultisigLedgerAccounts.useQuery();
  const accountsData = accounts.data;

  const [unsignedTransaction, setUnsignedTransaction] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<string | null>(
    accounts.data?.[0]?.name ?? null,
  );

  const accountOptions = useMemo(() => {
    return accountsData?.map((account) => {
      return {
        label: account.name,
        value: account.name,
        icon: null,
      };
    });
  }, [accountsData]);

  if (selectedAccount === null || accountOptions === undefined) {
    return <NoSpendingAccountsMessage />;
  }

  return (
    <Box>
      <Flex direction={"column"} gap={5}>
        <TextareaInput
          label="Unsigned Transaction Data"
          value={unsignedTransaction}
          onChange={(e) => {
            setUnsignedTransaction(e.target.value);
          }}
        />
        <Select
          name="account"
          value={selectedAccount}
          onChange={async (e) => {
            setSelectedAccount(e.target.value);
          }}
          label={"Signing Account"}
          options={accountOptions}
        />
      </Flex>
      <PillButton
        mt={8}
        height="60px"
        px={8}
        isDisabled={!unsignedTransaction}
        onClick={() => {
          onSubmit(unsignedTransaction, selectedAccount);
        }}
      >
        Next
      </PillButton>
    </Box>
  );
}

export function GetUnsignedTransaction({
  onSubmit,
}: {
  onSubmit: (transactionInfo: {
    unsignedTransaction: string;
    selectedAccount: string;
  }) => void;
}) {
  const { formatMessage } = useIntl();

  return (
    <WithExplanatorySidebar
      heading={formatMessage(messages.multisigGetUnsignedTransactionHeading)}
      description={formatMessage(
        messages.multisigCoordinatorGetUnsignedTransactionText,
      )}
      imgSrc={octopus}
    >
      <Tabs isLazy>
        <TabList mt={3} mb={8}>
          <Tab>{"Enter Unsigned Transaction"}</Tab>
          <Tab>{"Create Transfer Transaction"}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0}>
            <InputUnsignedTransaction
              onSubmit={(unsignedTransaction, selectedAccount) => {
                onSubmit({ unsignedTransaction, selectedAccount });
              }}
            />
          </TabPanel>
          <TabPanel p={0}>
            <CreateUnsignedTransactionForm
              onSubmit={(unsignedTransaction, selectedAccount) => {
                onSubmit({ unsignedTransaction, selectedAccount });
              }}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </WithExplanatorySidebar>
  );
}
