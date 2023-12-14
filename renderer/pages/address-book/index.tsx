import { HStack, Heading, Skeleton, Stack } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { defineMessages, useIntl } from "react-intl";
import { useToggle } from "usehooks-ts";

import { AddContactModal } from "@/components/AddContactModal/AddContactModal";
import {
  ContactRow,
  ContactHeadings,
} from "@/components/ContactRow/ContactRow";
import { EmptyStateMessage } from "@/components/EmptyStateMessage/EmptyStateMessage";
import { SearchInput } from "@/components/SearchInput/SearchInput";
import MainLayout from "@/layouts/MainLayout";
import { trpcReact } from "@/providers/TRPCProvider";
import { PillButton } from "@/ui/PillButton/PillButton";
import { CreateAccount } from "@/ui/SVGs/CreateAccount";

const messages = defineMessages({
  noContacts: {
    defaultMessage: "You don't have any contacts",
  },
  addressBookDescription: {
    defaultMessage:
      "Your address book is where you can manage all of your contacts, their names, and their public addresses.",
  },
});

export default function AddressBookPage() {
  const [isAddContactModalOpen, toggleAddContactModal] = useToggle(false);
  const [searchInput, setSearchInput] = useState("");
  const { data, isLoading } = trpcReact.getContacts.useQuery();
  const { formatMessage } = useIntl();

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
          <PillButton
            size="sm"
            variant="inverted"
            onClick={toggleAddContactModal}
          >
            <CreateAccount />
            {formatMessage({ defaultMessage: "Create Contact" })}
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
        <EmptyStateMessage
          heading={formatMessage(messages.noContacts)}
          description={formatMessage(messages.addressBookDescription)}
        />
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
