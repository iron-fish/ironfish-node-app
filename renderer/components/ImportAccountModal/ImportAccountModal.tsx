import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Heading,
  useToast,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { FormattedMessage, defineMessages, useIntl } from "react-intl";

import { ImportAccount } from "../ImportAccount/ImportAccount";

const messages = defineMessages({
  successTitle: {
    defaultMessage: "Account imported",
  },
  successDescription: {
    defaultMessage: "Your account was successfully imported",
  },
});

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function ImportAccountModal({ isOpen, onClose }: Props) {
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);
  const toast = useToast();
  const { formatMessage } = useIntl();
  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="700px">
        <ModalBody px={16} pt={16} pb={8}>
          <Heading fontSize="2xl" mb={4}>
            <FormattedMessage defaultMessage="Import Account" />
          </Heading>
          <ImportAccount
            onSuccess={() => {
              toast({
                title: formatMessage(messages.successTitle),
                description: formatMessage(messages.successDescription),
                status: "success",
                duration: 5000,
                isClosable: true,
              });
              onClose();
            }}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
