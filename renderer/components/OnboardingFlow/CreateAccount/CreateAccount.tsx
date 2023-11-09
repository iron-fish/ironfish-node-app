import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { trpcReact } from "@/providers/TRPCProvider";

import { ConfirmAccountStep } from "./ConfirmAccountStep";
import { CreateAccountStep } from "./CreateAccountStep";

type Steps = "create" | "confirm";

function useMaybeNewAccount() {
  const { data: accountsData, refetch: refetchGetAccounts } =
    trpcReact.getAccounts.useQuery();
  const { mutate: createAccount, isIdle: isCreateIdle } =
    trpcReact.createAccount.useMutation();
  const accountName = accountsData?.[0]?.name;
  const { data: exportData } = trpcReact.exportAccount.useQuery(
    {
      name: accountName ?? "",
      format: "Mnemonic",
    },
    {
      enabled: !!accountName,
    },
  );

  useEffect(() => {
    if (!isCreateIdle || accountsData === undefined) return;

    if (accountsData.length === 0) {
      createAccount(
        {
          name: "default",
        },
        {
          onSuccess: () => {
            refetchGetAccounts();
          },
        },
      );
    }
  }, [accountsData, createAccount, isCreateIdle, refetchGetAccounts]);

  const mnemonicPhrase = exportData?.account;

  return {
    accountName,
    mnemonicPhrase,
  };
}

export function CreateAccount() {
  const router = useRouter();
  const [step, setStep] = useState<Steps>("create");
  const [editedName, setEditedName] = useState<string | null>(null);
  const { mutate: renameAccount, isLoading: isRenameLoading } =
    trpcReact.renameAccount.useMutation();

  const { accountName, mnemonicPhrase } = useMaybeNewAccount();

  if (!accountName || typeof mnemonicPhrase !== "string") {
    return null;
  }

  const newAccountName = editedName !== null ? editedName : accountName;

  if (step === "create") {
    return (
      <CreateAccountStep
        accountName={newAccountName}
        onNameChange={(name: string) => {
          setEditedName(name);
        }}
        mnemonicPhrase={mnemonicPhrase}
        onBack={() => {
          router.back();
        }}
        onNextStep={() => {
          setStep("confirm");
        }}
      />
    );
  }
  return (
    <ConfirmAccountStep
      accountName={accountName}
      mnemonicPhrase={mnemonicPhrase}
      isLoading={isRenameLoading}
      onBack={() => {
        setStep("create");
      }}
      onNextStep={async () => {
        if (editedName !== null) {
          await renameAccount({
            account: accountName,
            newName: editedName,
          });
        }
        router.push("/onboarding/snapshot-download");
      }}
    />
  );
}
