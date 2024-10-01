import { Box } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";

import { trpcReact } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";
import { asQueryString } from "@/utils/parseRouteQuery";

import { CopyField } from "./CopyField";
import { NoSpendingAccountsMessage } from "../EmptyStateMessage/shared/NoSpendingAccountsMessage";
import { PendingData, SendAssetsFormContent } from "../SendAssetsForm/SendAssetsForm";
import { TransactionData } from "../SendAssetsForm/transactionSchema";

export function CreateUnsignedTransactionForm({ onSubmit }: { onSubmit: (unsignedTransaction: string) => void }) {
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

  const [pending, setPending] = useState<PendingData | null>(null);

  if (!accountsData) {
    return null;
  }

  if (accountsData.length === 0) {
    return <NoSpendingAccountsMessage />;
  }

  const handleSubmitUnsignedTransaction = (transactionData: TransactionData) => {
    createUnsignedTransaction(transactionData);
  }

  if(pending) {
    const { transactionData } = pending;
    return (<>
      { isIdle && (
        <>
          { JSON.stringify(transactionData) }
          <PillButton
            size="sm"
            isDisabled={isLoading}
            onClick={() => setPending(null)}
            variant="inverted"
            border={0}
          >
            {"Cancel"}
          </PillButton>
          <PillButton size="sm" isDisabled={isLoading} onClick={() => handleSubmitUnsignedTransaction(pending.transactionData)}>
          {"Confirm"}
          </PillButton>
        </>
      )}
      {isLoading && (
        "Creating Unsigned Transaction..."
      )}
      {isSuccess && (
        <Box>
          <CopyField label={"Unsigned Transaction"} value={unsignedTransactionData.unsignedTransaction} />
          <PillButton
              mt={8}
              height="60px"
              px={8}
              onClick={() => {
                  onSubmit(unsignedTransactionData.unsignedTransaction);
              }}
            >
              Done
          </PillButton>
        </Box>
      )}
      {isError && (
        error?.message ?? "Unknown error"
      )}
    </>);
  }

  return (
    <SendAssetsFormContent
      onPendingChange={setPending}
      accountsData={accountsData}
      defaultToAddress={defaultToAddress}
    />
  );
}


