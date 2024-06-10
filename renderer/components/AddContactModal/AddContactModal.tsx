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
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";
import * as z from "zod";

import { getTrpcVanillaClient, trpcReact } from "@/providers/TRPCProvider";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { PillButton } from "@/ui/PillButton/PillButton";

const messages = defineMessages({
  addContact: {
    defaultMessage: "Add Contact",
  },
  contactName: {
    defaultMessage: "This contact's name is only visible to you.",
  },
  loading: {
    defaultMessage: "Loading...",
  },
  addContactError: {
    defaultMessage: "Add Contact Error",
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
  addContactButton: {
    defaultMessage: "Add Contact",
  },
  closeButton: {
    defaultMessage: "Close",
  },
  name: {
    defaultMessage: "Name",
  },
  address: {
    defaultMessage: "Address",
  },
  duplicateContactError: {
    defaultMessage: "A contact with that address already exists.",
  },
});

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const contactSchema = z.object({
  name: z.string().min(1),
  address: z
    .string()
    .min(1)
    .refine(async (value) => {
      const client = getTrpcVanillaClient();
      const response = await client.isValidPublicAddress.query({
        address: value,
      });
      return !!response?.valid;
    }, "Invalid public address"),
});

export function AddContactModal({ isOpen, onClose }: Props) {
  const {
    mutate: addContact,
    isIdle,
    isLoading,
    isError,
    isSuccess,
    reset: resetMutation,
    error,
  } = trpcReact.addContact.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
  });

  const { formatMessage } = useIntl();

  const handleClose = useCallback(() => {
    resetMutation();
    onClose();
  }, [onClose, resetMutation]);

  useEffect(() => {
    if (isSuccess) {
      resetMutation();
      handleClose();
    }
  }, [handleClose, isSuccess, resetMutation]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="600px">
        <ModalBody px={16} pt={16}>
          {!isError && (
            <>
              <Heading fontSize="2xl" mb={4}>
                {formatMessage(messages.addContact)}
              </Heading>

              <Text fontSize="md" mb={6}>
                {formatMessage(messages.contactName)}
              </Text>

              {isLoading ? (
                <Box py={8}>
                  <Progress size="sm" isIndeterminate />
                </Box>
              ) : (
                <VStack gap={4} alignItems="stretch">
                  <TextInput
                    {...register("name")}
                    label={formatMessage(messages.name)}
                    error={errors.name?.message}
                  />
                  <TextInput
                    {...register("address")}
                    label={formatMessage(messages.address)}
                    error={errors.address?.message}
                  />
                </VStack>
              )}
            </>
          )}

          {isError && (
            <>
              <Heading fontSize="2xl" mb={8}>
                {formatMessage(messages.addContactError)}
              </Heading>
              <Text fontSize="md">
                {formatMessage(
                  error.message === "DUPLICATE_CONTACT_ERROR"
                    ? messages.duplicateContactError
                    : messages.somethingWentWrong,
                )}
              </Text>
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
                  handleSubmit((values) => {
                    addContact(values);
                  })();
                }}
              >
                {formatMessage(messages.addContactButton)}
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
                  resetMutation();
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
