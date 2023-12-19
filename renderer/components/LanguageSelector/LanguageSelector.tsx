import {
  Text,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Heading,
  ModalFooter,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";

import { COLORS } from "@/ui/colors";
import { Select } from "@/ui/Forms/Select/Select";
import { PillButton } from "@/ui/PillButton/PillButton";

import { DropdownTrigger } from "../DropdownTrigger/DropdownTrigger";

const messages = defineMessages({
  langEnglish: {
    defaultMessage: "English",
  },
  langSpanish: {
    defaultMessage: "Spanish",
  },
  chooseLanguage: {
    defaultMessage: "Choose your language",
  },
  description: {
    defaultMessage:
      "The Iron Fish Node app supports X languages. If your preferred language isn't listed, please reach out and let us know!",
  },
  close: {
    defaultMessage: "Close",
  },
});

const sortOptions = [
  {
    label: messages.langEnglish,
    value: "en",
  },
  {
    label: messages.langSpanish,
    value: "sp",
  },
];

export function LanguageSelector() {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <HStack
        as="button"
        borderRadius="5px"
        bg={COLORS.GRAY_LIGHT}
        color={COLORS.GRAY_MEDIUM}
        justifyContent="center"
        py="6px"
        _dark={{
          bg: COLORS.DARK_MODE.GRAY_MEDIUM,
          color: COLORS.DARK_MODE.GRAY_LIGHT,
        }}
        onClick={onOpen}
      >
        <Text as="span">English</Text>
      </HStack>
      <LanguageSelectorModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}

function LanguageSelectorModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { formatMessage } = useIntl();
  const translatedOptions = sortOptions.map((option) => ({
    ...option,
    label: formatMessage(option.label),
  }));
  const { register } = useForm({
    defaultValues: {
      language: "en",
    },
  });
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="600px">
        <ModalBody px={16} pt={16}>
          <Heading fontSize="2xl" mb={4}>
            {formatMessage(messages.chooseLanguage)}
          </Heading>
          <Text mb={8}>{formatMessage(messages.description)}</Text>

          <Select
            {...register("language")}
            label="Language"
            options={translatedOptions}
          />
        </ModalBody>

        <ModalFooter display="flex" gap={2} py={8}>
          <PillButton height="60px" px={8} border={0} onClick={onClose}>
            {formatMessage(messages.close)}
          </PillButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
