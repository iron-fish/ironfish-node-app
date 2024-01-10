import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  HStack,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";
import { z } from "zod";

import { getTrpcVanillaClient, trpcReact } from "@/providers/TRPCProvider";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { PillButton } from "@/ui/PillButton/PillButton";
import { useIFToast } from "@/ui/Toast/Toast";

const messages = defineMessages({
  contactUpdated: {
    defaultMessage: "Contact updated",
  },
  deleteContact: {
    defaultMessage: "Delete Contact",
  },
  cancel: {
    defaultMessage: "Cancel",
  },
  delete: {
    defaultMessage: "Delete",
  },
  deleteConfirmation: {
    defaultMessage: "Are you sure? You can't undo this action afterwards.",
  },
  saveChanges: {
    defaultMessage: "Save Changes",
  },
  name: {
    defaultMessage: "Name",
  },
  address: {
    defaultMessage: "Address",
  },
});

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

type Props = {
  id: string;
  name: string;
  address: string;
};

export function EditContactForm({ id, name, address }: Props) {
  const router = useRouter();
  const toast = useIFToast();
  const { formatMessage } = useIntl();

  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();
  const cancelDeleteRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name,
      address,
    },
  });

  const addressValue = watch("address");

  const { mutate: editContact, isLoading: isEditLoading } =
    trpcReact.editContact.useMutation({
      onSuccess: () => {
        toast({
          message: formatMessage(messages.contactUpdated),
          duration: 5000,
        });
        if (address !== addressValue) {
          router.replace(`/address-book/${addressValue}`);
        }
      },
    });

  const { mutate: deleteContact, isLoading: isDeleteLoading } =
    trpcReact.deleteContact.useMutation({
      onSuccess: () => {
        router.replace("/address-book");
      },
    });

  const isLoading = isEditLoading || isDeleteLoading;

  return (
    <>
      <VStack alignItems="stretch" gap={8}>
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
        <HStack>
          <PillButton
            isDisabled={isLoading}
            height="60px"
            px={8}
            onClick={() => {
              handleSubmit((values) => {
                editContact({ id, ...values });
              })();
            }}
          >
            {formatMessage(messages.saveChanges)}
          </PillButton>
          <PillButton
            isDisabled={isLoading}
            onClick={onDeleteModalOpen}
            variant="inverted"
            height="60px"
            px={8}
            border={0}
          >
            {formatMessage(messages.deleteContact)}
          </PillButton>
        </HStack>
      </VStack>
      <AlertDialog
        isOpen={isDeleteModalOpen}
        leastDestructiveRef={cancelDeleteRef}
        onClose={onDeleteModalClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {formatMessage(messages.deleteContact)}
            </AlertDialogHeader>

            <AlertDialogBody>
              {formatMessage(messages.deleteConfirmation)}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelDeleteRef} onClick={onDeleteModalClose}>
                {formatMessage(messages.cancel)}
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  deleteContact({ id });
                }}
                ml={3}
              >
                {formatMessage(messages.delete)}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
