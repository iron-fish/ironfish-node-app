import { HStack, Heading, Skeleton, Stack, Text, Box } from "@chakra-ui/react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useToggle } from "usehooks-ts";

import { AddContactModal } from "@/components/AddContactModal/AddContactModal";
import {
  ContactRow,
  ContactHeadings,
} from "@/components/ContactRow/ContactRow";
import { SearchInput } from "@/components/SearchInput/SearchInput";
import emptyFish from "@/images/empty-fish.svg";
import MainLayout from "@/layouts/MainLayout";
import { trpcReact } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";
import { CreateAccount } from "@/ui/SVGs/CreateAccount";

export default function AddressBookPage() {
  const [isAddContactModalOpen, toggleAddContactModal] = useToggle(false);
  const [searchInput, setSearchInput] = useState("");
  const { data, isLoading } = trpcReact.getContacts.useQuery();

  const filteredData = useMemo(() => {
    return data?.filter((contact) => {
      return (
        contact.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        contact.address.toLowerCase().includes(searchInput.toLowerCase())
      );
    });
  }, [data, searchInput]);

  return (
    <MainLayout>
      <HStack mb={10}>
        <Heading flexGrow={1}>Address Book</Heading>
        <HStack>
          <PillButton variant="inverted" onClick={toggleAddContactModal}>
            <CreateAccount />
            Create Contact
          </PillButton>
        </HStack>
      </HStack>
      {isLoading && (
        <Stack>
          <Skeleton height="30px" mb={2} />
          <Skeleton height="50px" w="98%" />
          <Skeleton height="50px" w="90%" />
          <Skeleton height="50px" w="95%" />
          <Skeleton height="50px" w="90%" />
        </Stack>
      )}
      {!isLoading && data?.length === 0 ? (
        <Box textAlign="center">
          <Heading fontSize="2xl" mb={4}>
            You don&apos;t have any contacts
          </Heading>
          <Text maxW="50ch" mx="auto" mb={8}>
            Your address book is where you can manage all of your contacts,
            their names, and their public addresses.
          </Text>
          <Image src={emptyFish} alt="" />
        </Box>
      ) : (
        <>
          <HStack w="100%" mb={4}>
            <SearchInput onChange={(e) => setSearchInput(e.target.value)} />
          </HStack>
          <ContactHeadings />
          {filteredData?.map((contact) => {
            return (
              <ContactRow
                key={contact.id}
                name={contact.name}
                address={contact.address}
              />
            );
          })}
        </>
      )}
      <AddContactModal
        isOpen={isAddContactModalOpen}
        onClose={toggleAddContactModal}
      />
    </MainLayout>
  );
}
