import { HStack, Heading } from "@chakra-ui/react";
import { useState } from "react";
import { useToggle } from "usehooks-ts";

import { AddContactModal } from "@/components/AddContactModal/AddContactModal";
import {
  ContactRow,
  ContactHeadings,
} from "@/components/ContactRow/ContactRow";
import { SearchInput } from "@/components/SearchInput/SearchInput";
import MainLayout from "@/layouts/MainLayout";
import { trpcReact } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";
import { CreateAccount } from "@/ui/SVGs/CreateAccount";

export default function AddressBookPage() {
  const [isAddContactModalOpen, toggleAddContactModal] = useToggle(false);
  const [searchInput, setSearchInput] = useState("");
  const { data } = trpcReact.getContacts.useQuery();

  console.log(data, searchInput);

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
      <HStack w="100%" mb={4}>
        <SearchInput onChange={(e) => setSearchInput(e.target.value)} />
      </HStack>
      <ContactHeadings />
      {data?.map((contact) => {
        return (
          <ContactRow
            key={contact.id}
            name={contact.name}
            address={contact.address}
          />
        );
      })}
      <AddContactModal
        isOpen={isAddContactModalOpen}
        onClose={toggleAddContactModal}
      />
    </MainLayout>
  );
}
