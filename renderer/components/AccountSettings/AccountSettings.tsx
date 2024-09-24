import { HStack, VStack, useDisclosure } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { defineMessages, useIntl } from "react-intl";

import { RemoveAccountModal } from "@/components/RemoveAccountModal/RemoveAccountModal";
import { trpcReact } from "@/providers/TRPCProvider";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { PillButton } from "@/ui/PillButton/PillButton";
import { useIFToast } from "@/ui/Toast/Toast";

type Props = {
  accountName: string;
};

const messages = defineMessages({
  accountName: {
    defaultMessage: "Account name",
  },
  enterName: {
    defaultMessage: "Please enter a name for this account",
  },
  saveChanges: {
    defaultMessage: "Save Changes",
  },
  removeAccount: {
    defaultMessage: "Remove Account",
  },
});

export function AccountSettings({ accountName }: Props) {
  const router = useRouter();
  const toast = useIFToast();
  const { formatMessage } = useIntl();

  const [newName, setNewName] = useState(accountName);
  const [hasChangedName, setHasChangedName] = useState(false);

  const { data: isSyncedData } = trpcReact.isAccountSynced.useQuery(
    {
      account: accountName,
    },
    {
      refetchInterval: 5000,
    },
  );

  const { data: accountData } = trpcReact.getAccount.useQuery(
    {
      name: accountName,
    },
    {
      refetchInterval: 5000,
    },
  );

  // @todo: Renaming the account causes the parent component to refetch an account which no longer exists,
  // causing an error. The error doesn't cause any issues, because once the redirect happens, the parent
  // fetches the correct account. We should fix this, but likely a low priority.
  const { mutate: renameAccount, isLoading: isRenameLoading } =
    trpcReact.renameAccount.useMutation({
      onSuccess: () => {
        router.replace(`/accounts/${newName}?tab=settings`);
        toast({
          message: `Renamed account ${accountName} to ${newName}`,
          duration: 5000,
        });
        setHasChangedName(false);
      },
    });

  const hasValidName = newName.length > 0;

  const {
    isOpen: isRemoveModalOpen,
    onOpen: onRemoveModalOpen,
    onClose: onRemoveModalClose,
  } = useDisclosure();

  return (
    <>
      <VStack alignItems="stretch" gap={8}>
        <TextInput
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value);
            if (!hasChangedName) {
              setHasChangedName(true);
            }
          }}
          label={formatMessage(messages.accountName)}
          error={hasValidName ? undefined : formatMessage(messages.enterName)}
        />
        <HStack>
          <PillButton
            isDisabled={!hasValidName || !hasChangedName}
            height="60px"
            px={8}
            onClick={() =>
              renameAccount({
                account: accountName,
                newName,
              })
            }
          >
            {formatMessage(messages.saveChanges)}
          </PillButton>
          <PillButton
            isDisabled={isRenameLoading}
            onClick={onRemoveModalOpen}
            variant="inverted"
            height="60px"
            px={8}
            border={0}
          >
            {formatMessage(messages.removeAccount)}
          </PillButton>
        </HStack>
      </VStack>
      {isSyncedData && accountData && (
        <RemoveAccountModal
          isOpen={isRemoveModalOpen}
          onClose={onRemoveModalClose}
          isSynced={isSyncedData.synced}
          account={accountData}
        />
      )}
    </>
  );
}
