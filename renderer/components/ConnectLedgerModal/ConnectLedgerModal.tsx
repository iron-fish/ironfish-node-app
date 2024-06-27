import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalBody,
  Heading,
} from "@chakra-ui/react";
import Image from "next/image";

import connectImage from "./assets/connect.svg";

export function ConnectLedgerModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="600px">
        <ModalBody px={16} pt={16}>
          <Heading>Connect your Ledger</Heading>
          <Image src={connectImage} alt="" />
        </ModalBody>

        <ModalFooter display="flex" gap={2} px={16} py={8}></ModalFooter>
      </ModalContent>
    </Modal>
  );
}
