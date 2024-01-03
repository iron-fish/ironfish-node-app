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
import { z } from "zod";

import { getTrpcVanillaClient, trpcReact } from "@/providers/TRPCProvider";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { PillButton } from "@/ui/PillButton/PillButton";
import { useIFToast } from "@/ui/Toast/Toast";

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

  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();
  const cancelDeleteRef = useRef(null);

  const { mutate: editContact, isLoading: isEditLoading } =
    trpcReact.editContact.useMutation({
      onSuccess: () => {
        toast({
          message: "Contact updated",
          duration: 5000,
        });
      },
    });

  const { mutate: deleteContact, isLoading: isDeleteLoading } =
    trpcReact.deleteContact.useMutation({
      onSuccess: () => {
        router.replace("/address-book");
      },
    });

  const isLoading = isEditLoading || isDeleteLoading;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name,
      address,
    },
  });

  return (
    <>
      <VStack alignItems="stretch" gap={8} mt={5}>
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
            Save Changes
          </PillButton>
          <PillButton
            isDisabled={isLoading}
            onClick={onDeleteModalOpen}
            variant="inverted"
            height="60px"
            px={8}
            border={0}
          >
            Delete Contact
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
              Delete Contact
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can&apos;t undo this action afterwards.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelDeleteRef} onClick={onDeleteModalClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  deleteContact({ id });
                }}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
