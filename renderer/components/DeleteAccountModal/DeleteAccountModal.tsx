import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  Heading,
  Text,
  VStack,
  Box,
  Progress,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";

import { getTrpcVanillaClient, trpcReact } from "@/providers/TRPCProvider";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { PillButton } from "@/ui/PillButton/PillButton";
import { formatOre } from "@/utils/ironUtils";

const messages = defineMessages({
  deleteAccount: {
    defaultMessage: "Delete Account",
  },
  notSyncedWarning: {
    defaultMessage:
      "This account is not yet synced and may contain $IRON or other assets.",
  },
  hasBalanceWarning: {
    defaultMessage: "This account currently holds the following assets:",
  },
  loseAssetsWarning: {
    defaultMessage:
      "If you delete this account without exporting it first, YOU WILL LOSE THESE ASSETS.",
  },
  loading: {
    defaultMessage: "Loading...",
  },
  tryAgain: {
    defaultMessage: "Try Again",
  },
  somethingWentWrong: {
    defaultMessage: "Something went wrong, please try again.",
  },
  cancel: {
    defaultMessage: "Cancel",
  },
  deleteAccountButton: {
    defaultMessage: "Delete Account",
  },
  closeButton: {
    defaultMessage: "Close",
  },
  areYouSure: {
    defaultMessage: "Are you sure you want to delete the account?",
  },
  typeToDelete: {
    defaultMessage: "Type ''{accountName}'' to delete",
  },
  textMustMatch: {
    defaultMessage: "Text must match the account name ''{accountName}''",
  },
});

type Props = {
  isOpen: boolean;
  onClose: () => void;
  isSynced: boolean;
  account: Awaited<
    ReturnType<ReturnType<typeof getTrpcVanillaClient>["getAccount"]["query"]>
  >;
};

export function DeleteAccountModal({
  isOpen,
  onClose,
  account,
  isSynced,
}: Props) {
  const router = useRouter();

  const {
    mutate: deleteAccount,
    isIdle,
    isLoading,
    isError,
    isSuccess,
    reset,
  } = trpcReact.deleteAccount.useMutation({
    onSuccess: () => {
      router.replace("/accounts");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<{ name: string }>();

  const { formatMessage } = useIntl();

  const handleClose = useCallback(() => {
    reset();
    resetForm();
    onClose();
  }, [onClose, reset, resetForm]);

  useEffect(() => {
    if (isSuccess) {
      reset();
      resetForm();
      handleClose();
    }
  }, [handleClose, isSuccess, reset, resetForm]);

  const balances = [account.balances.iron, ...account.balances.custom].filter(
    (b) => b.unconfirmed !== "0",
  );
  const hasBalance = balances.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="600px">
        <ModalBody px={16} pt={16}>
          {!isError && (
            <>
              <Heading fontSize="2xl" mb={4}>
                {formatMessage(messages.deleteAccount)}
              </Heading>

              {!isSynced && (
                <Text fontSize="md" mb={6}>
                  {formatMessage(messages.notSyncedWarning)}
                </Text>
              )}

              {isSynced && hasBalance && (
                <>
                  <Text fontSize="md" mb={6}>
                    {formatMessage(messages.hasBalanceWarning)}
                  </Text>
                  <UnorderedList mb={6}>
                    {balances.map((b) => (
                      <ListItem key={b.assetId}>{`${formatOre(b.unconfirmed)} ${
                        b.asset.name
                      }`}</ListItem>
                    ))}
                  </UnorderedList>
                </>
              )}

              {(!isSynced || hasBalance) && (
                <Text fontSize="md" mb={6}>
                  {formatMessage(messages.loseAssetsWarning)}
                </Text>
              )}

              <Text fontSize="md" mb={6}>
                {formatMessage(messages.areYouSure, {
                  accountName: account.name,
                })}
              </Text>

              {isError && (
                <Text fontSize="md">
                  {formatMessage(messages.somethingWentWrong)}
                </Text>
              )}

              {isLoading ? (
                <Box py={8}>
                  <Progress size="sm" isIndeterminate />
                </Box>
              ) : (
                <VStack gap={4} alignItems="stretch">
                  <TextInput
                    {...register("name", {
                      validate: (input) => input === account.name,
                    })}
                    label={formatMessage(messages.typeToDelete, {
                      accountName: account.name,
                    })}
                    error={
                      errors.name &&
                      formatMessage(messages.textMustMatch, {
                        accountName: account.name,
                      })
                    }
                  />
                </VStack>
              )}
            </>
          )}
        </ModalBody>

        <ModalFooter display="flex" gap={2} px={16} py={8}>
          {(isIdle || isLoading) && (
            <>
              <PillButton
                size="sm"
                isDisabled={isLoading}
                onClick={handleClose}
                variant="inverted"
                border={0}
              >
                {formatMessage(messages.cancel)}
              </PillButton>
              <PillButton
                size="sm"
                isDisabled={isLoading}
                onClick={() => {
                  handleSubmit(() => {
                    deleteAccount({ account: account.name });
                  })();
                }}
              >
                {formatMessage(messages.deleteAccountButton)}
              </PillButton>
            </>
          )}
          {isError && (
            <>
              <PillButton
                size="sm"
                isDisabled={isLoading}
                onClick={onClose}
                variant="inverted"
                border={0}
              >
                {formatMessage(messages.closeButton)}
              </PillButton>
              <PillButton
                size="sm"
                isDisabled={isLoading}
                onClick={() => {
                  resetForm();
                  reset();
                }}
              >
                {formatMessage(messages.tryAgain)}
              </PillButton>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
