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
import { FormattedMessage } from "react-intl";
import { z } from "zod";

import { trpcReact } from "@/providers/TRPCProvider";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { PillButton } from "@/ui/PillButton/PillButton";

import { AccountMnemonicView } from "../AccountMnemonicView/AccountMnenomicView";

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
                <FormattedMessage defaultMessage="Create Account" />
              </Heading>

              <Text fontSize="md">
                <FormattedMessage defaultMessage="What would you like to name this account? This name is only visible to you." />
              </Text>

              <VStack gap={4} alignItems="stretch">
                <TextInput
                  {...register("name")}
                  label="Account Name"
                  error={errors.name?.message}
                  isDisabled={isLoading}
                />
              </VStack>

              {isError && (
                <Alert status="error">
                  <AlertIcon />
                  {error?.message ?? "Something went wrong, please try again."}
                </Alert>
              )}
            </VStack>
          )}

          {isSuccess && (
            <Box>
              <Heading fontSize="2xl" mb={4}>
                <FormattedMessage defaultMessage="Account Created" />
              </Heading>

              <VStack gap={4} alignItems="stretch" mb={8}>
                <TextInput isReadOnly label="Account Name" value={data.name} />
              </VStack>

              <Heading fontSize="2xl" mb={4}>
                <FormattedMessage defaultMessage="Recovery Phrase" />
              </Heading>

              <Text fontSize="md" mb={4}>
                <FormattedMessage defaultMessage="Please write down this recovery phrase and keep it in a safe place. You will need it to recover your account." />
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
                <FormattedMessage defaultMessage="I saved my recovery phrase" />
              </Checkbox>
            </Box>
          )}
        </ModalBody>

        <ModalFooter display="flex" gap={2} py={8}>
          {!isSuccess && (
            <>
              <PillButton
                isDisabled={isLoading}
                onClick={handleClose}
                variant="inverted"
                height="60px"
                px={8}
                border={0}
              >
                <FormattedMessage defaultMessage="Cancel" />
              </PillButton>
              <PillButton
                isDisabled={isLoading}
                height="60px"
                px={8}
                onClick={handleSubmit((values) => {
                  createAccount(values);
                })}
              >
                <FormattedMessage defaultMessage="Create Account" />
              </PillButton>
            </>
          )}
          {isSuccess && (
            <PillButton
              isDisabled={!isSavedChecked}
              height="60px"
              px={8}
              onClick={handleClose}
            >
              <FormattedMessage defaultMessage="Close" />
            </PillButton>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
