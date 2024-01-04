import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  Heading,
  Text,
  Box,
  VStack,
  Checkbox,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";
import { z } from "zod";

import { trpcReact } from "@/providers/TRPCProvider";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { PillButton } from "@/ui/PillButton/PillButton";

import { AccountMnemonicView } from "../AccountMnemonicView/AccountMnenomicView";

const messages = defineMessages({
  createAccount: {
    defaultMessage: "Create Account",
  },
  accountName: {
    defaultMessage: "Account Name",
  },
  whatToName: {
    defaultMessage:
      "What would you like to name this account? This name is only visible to you.",
  },
  somethingWentWrong: {
    defaultMessage: "Something went wrong, please try again.",
  },
  accountCreated: {
    defaultMessage: "Account Created",
  },
  recoveryPhrase: {
    defaultMessage: "Recovery Phrase",
  },
  writeDownRecoveryPhrase: {
    defaultMessage:
      "Please write down this recovery phrase and keep it in a safe place. You will need it to recover your account.",
  },
  savedRecoveryPhrase: {
    defaultMessage: "I saved my recovery phrase",
  },
  cancel: {
    defaultMessage: "Cancel",
  },
  close: {
    defaultMessage: "Close",
  },
});

const accountSchema = z.object({
  name: z.string().min(1),
});

export function CreateAccountModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    mutate: createAccount,
    data,
    error,
    isError,
    isSuccess,
    isLoading,
    reset,
  } = trpcReact.createAccount.useMutation();

  const [isSavedChecked, setIsSavedChecked] = useState(false);

  const handleClose = useCallback(() => {
    // If the account was created successfully, the user must confirm that they
    // saved their recovery phrase before closing the modal.
    if (isSuccess && !isSavedChecked) {
      return;
    }

    reset();
    onClose();
  }, [isSavedChecked, isSuccess, onClose, reset]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
  });

  const { formatMessage } = useIntl();

  if (isSuccess && !data) {
    throw new Error(
      "Create account mutation succeeded but no data was returned",
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="600px">
        <ModalBody px={16} pt={16}>
          {!isSuccess && (
            <VStack gap={4} alignItems="stretch">
              <Heading fontSize="2xl">
                {formatMessage(messages.createAccount)}
              </Heading>

              <Text fontSize="md">{formatMessage(messages.whatToName)}</Text>

              <VStack gap={4} alignItems="stretch">
                <TextInput
                  {...register("name")}
                  label={formatMessage(messages.accountName)}
                  error={errors.name?.message}
                  isDisabled={isLoading}
                />
              </VStack>

              {isError && (
                <Alert status="error">
                  <AlertIcon />
                  {error?.message ?? formatMessage(messages.somethingWentWrong)}
                </Alert>
              )}
            </VStack>
          )}

          {isSuccess && (
            <Box>
              <Heading fontSize="2xl" mb={4}>
                {formatMessage(messages.accountCreated)}
              </Heading>

              <VStack gap={4} alignItems="stretch" mb={8}>
                <TextInput
                  isReadOnly
                  label={formatMessage(messages.accountName)}
                  value={data.name}
                />
              </VStack>

              <Heading fontSize="2xl" mb={4}>
                {formatMessage(messages.recoveryPhrase)}
              </Heading>

              <Text fontSize="md" mb={4}>
                {formatMessage(messages.writeDownRecoveryPhrase)}
              </Text>

              <Box mb={4}>
                <AccountMnemonicView accountName={data.name} />
              </Box>

              <Checkbox
                checked={isSavedChecked}
                onChange={(e) => {
                  setIsSavedChecked(e.target.checked);
                }}
              >
                {formatMessage(messages.savedRecoveryPhrase)}
              </Checkbox>
            </Box>
          )}
        </ModalBody>

        <ModalFooter display="flex" gap={2} px={16} py={8}>
          {!isSuccess && (
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
                onClick={handleSubmit((values) => {
                  createAccount(values);
                })}
              >
                {formatMessage(messages.createAccount)}
              </PillButton>
            </>
          )}
          {isSuccess && (
            <PillButton
              size="sm"
              isDisabled={!isSavedChecked}
              onClick={handleClose}
            >
              {formatMessage(messages.close)}
            </PillButton>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
