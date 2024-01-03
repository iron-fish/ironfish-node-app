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
import * as z from "zod";

import { getTrpcVanillaClient, trpcReact } from "@/providers/TRPCProvider";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { PillButton } from "@/ui/PillButton/PillButton";

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
  } = trpcReact.addContact.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
  });

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
                Add Contact
              </Heading>

              <Text fontSize="md" mb={4}>
                This contact&apos;s name is only visible to you.
              </Text>

              {isLoading ? (
                <Box py={8}>
                  <Progress size="sm" isIndeterminate />
                </Box>
              ) : (
                <VStack gap={4} alignItems="stretch">
                  <TextInput
                    {...register("name")}
                    label="Name"
                    error={errors.name?.message}
                  />
                  <TextInput
                    {...register("address")}
                    label="Address"
                    error={errors.address?.message}
                  />
                </VStack>
              )}
            </>
          )}

          {isError && (
            <>
              <Heading fontSize="2xl" mb={8}>
                Add Contact Error
              </Heading>
              <Text fontSize="md">Something went wrong, please try again.</Text>
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
                Cancel
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
                Add Contact
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
                Close
              </PillButton>
              <PillButton
                size="sm"
                isDisabled={isLoading}
                onClick={() => {
                  resetForm();
                  resetMutation();
                }}
              >
                Try Again
              </PillButton>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
