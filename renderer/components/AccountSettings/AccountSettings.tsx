import {
  HStack,
  VStack,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogBody,
  Button,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useRef, useState } from "react";

import { trpcReact } from "@/providers/TRPCProvider";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { PillButton } from "@/ui/PillButton/PillButton";

type Props = {
  accountName: string;
};

export function AccountSettings({ accountName }: Props) {
  const router = useRouter();
  const toast = useToast();

  const [newName, setNewName] = useState(accountName);

  // @todo: Renaming the account causes the parent component to refetch an account which no longer exists,
  // causing an error. The error doesn't cause any issues, because once the redirect happens, the parent
  // fetches the correct account. We should fix this, but likely a low priority.
  const { mutate: renameAccount, isLoading: isRenameLoading } =
    trpcReact.renameAccount.useMutation({
      onSuccess: () => {
        router.replace(`/accounts/${newName}?tab=settings`);
        toast({
          title: "Account renamed",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      },
    });

  const { mutate: deleteAccount, isLoading: isDeleteLoading } =
    trpcReact.deleteAccount.useMutation({
      onSuccess: () => {
        router.replace("/accounts");
      },
    });

  const hasValidName = newName.length > 0;

  const {
    isOpen: isDeleteModalOpen,
    onOpen: onDeleteModalOpen,
    onClose: onDeleteModalClose,
  } = useDisclosure();
  const cancelDeleteRef = useRef(null);

  return (
    <>
      <VStack alignItems="stretch" gap={8}>
        <TextInput
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value);
          }}
          label="Account name"
          error={
            hasValidName ? undefined : "Please enter a name for this account"
          }
        />
        <HStack>
          <PillButton
            isDisabled={false}
            height="60px"
            px={8}
            onClick={() =>
              renameAccount({
                account: accountName,
                newName,
              })
            }
          >
            Save Changes
          </PillButton>
          <PillButton
            isDisabled={isRenameLoading}
            onClick={onDeleteModalOpen}
            variant="inverted"
            height="60px"
            px={8}
            border={0}
          >
            Delete Account
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
                isDisabled={isDeleteLoading}
                colorScheme="red"
                onClick={() => {
                  deleteAccount({ account: accountName });
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
