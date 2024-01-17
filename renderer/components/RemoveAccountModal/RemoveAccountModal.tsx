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
import { hexToUTF16String } from "@/utils/hexToUTF16String";
import { formatOre } from "@/utils/ironUtils";

const messages = defineMessages({
  removeAccount: {
    defaultMessage: "Remove Account",
  },
  notSyncedWarning: {
    defaultMessage:
      "This account is not yet synced and may contain $IRON or other assets.",
  },
  hasBalanceWarning: {
    defaultMessage: "It currently holds:",
  },
  loseAccessWarning: {
    defaultMessage:
      "If you remove this account without exporting it first, YOU WILL LOSE ACCESS TO IT.",
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
  removeAccountButton: {
    defaultMessage: "Remove Account",
  },
  closeButton: {
    defaultMessage: "Close",
  },
  areYouSure: {
    defaultMessage: "Are you sure you want to remove this account?",
  },
  typeToRemove: {
    defaultMessage: "Type ''{accountName}'' to remove",
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

export function RemoveAccountModal({
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
        <ModalBody px={16} pt={16} pb={0}>
          {!isError && (
            <>
              <Heading fontSize="28px" lineHeight="160%" mb={4}>
                {formatMessage(messages.removeAccount)}
              </Heading>

              <Text fontSize="md" mb={6}>
                {formatMessage(messages.areYouSure, {
                  accountName: account.name,
                })}{" "}
                {isSynced &&
                  hasBalance &&
                  formatMessage(messages.hasBalanceWarning)}{" "}
                {!isSynced && formatMessage(messages.notSyncedWarning)}
              </Text>

              {isSynced && hasBalance && (
                <UnorderedList mb={6} pl={1}>
                  {balances.map((b) => (
                    <ListItem key={b.assetId}>{`${formatOre(
                      b.unconfirmed,
                    )} ${hexToUTF16String(b.asset.name)}`}</ListItem>
                  ))}
                </UnorderedList>
              )}

              <Text fontSize="md" mb={8}>
                {formatMessage(messages.loseAccessWarning)}
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
                    label={formatMessage(messages.typeToRemove, {
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
                {formatMessage(messages.removeAccountButton)}
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
