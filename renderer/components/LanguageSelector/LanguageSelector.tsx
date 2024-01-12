import {
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Heading,
  ModalFooter,
  useDisclosure,
  Flex,
  Box,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { FaChevronDown } from "react-icons/fa";
import { MdOutlineLanguage } from "react-icons/md";
import { defineMessages, useIntl } from "react-intl";
import { z } from "zod";

import { useSelectedLocaleContext, Locales } from "@/intl/IntlProvider";
import { COLORS } from "@/ui/colors";
import { Select } from "@/ui/Forms/Select/Select";
import { PillButton } from "@/ui/PillButton/PillButton";

const messages = defineMessages({
  langEnglish: {
    defaultMessage: "English",
  },
  langSpanish: {
    defaultMessage: "Spanish",
  },
  langChinese: {
    defaultMessage: "Chinese",
  },
  langRussian: {
    defaultMessage: "Russian",
  },
  langUkrainian: {
    defaultMessage: "Ukrainian",
  },
  chooseLanguage: {
    defaultMessage: "Choose your language",
  },
  selectLanguage: {
    defaultMessage: "Select language",
  },
  description: {
    defaultMessage:
      "The Iron Fish Node app supports {languageCount} languages. If your preferred language isn't listed, please reach out and let us know!",
  },
  close: {
    defaultMessage: "Close",
  },
});

const languageOptionsMap: {
  [K in Locales]: {
    message: (typeof messages)[keyof typeof messages];
    ownLanguageLabel: string;
    value: K;
  };
} = {
  "en-US": {
    message: messages.langEnglish,
    ownLanguageLabel: "English",
    value: "en-US",
  },
  "es-MX": {
    message: messages.langSpanish,
    ownLanguageLabel: "Español",
    value: "es-MX",
  },
  "zh-CN": {
    message: messages.langChinese,
    ownLanguageLabel: "中文",
    value: "zh-CN",
  },
  "ru-RU": {
    message: messages.langRussian,
    ownLanguageLabel: "Русский",
    value: "ru-RU",
  },
  "uk-UA": {
    message: messages.langUkrainian,
    ownLanguageLabel: "Українська",
    value: "uk-UA",
  },
};

const languageOptions = Object.values(languageOptionsMap);

const localeSchema = z.object({
  language: z.enum(["en-US", "es-MX", "zh-CN", "ru-RU", "uk-UA"]),
});

export function LanguageSelector() {
  const { formatMessage } = useIntl();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const selectedLocaleContext = useSelectedLocaleContext();
  const selectedLanguage = languageOptionsMap[selectedLocaleContext.locale];

  return (
    <>
      <Flex
        aria-label={formatMessage(messages.selectLanguage)}
        as="button"
        borderRadius="5px"
        bg={COLORS.GRAY_LIGHT}
        color={COLORS.GRAY_MEDIUM}
        justifyContent="center"
        alignItems="center"
        py="6px"
        _dark={{
          bg: COLORS.DARK_MODE.GRAY_MEDIUM,
          color: COLORS.DARK_MODE.GRAY_LIGHT,
        }}
        width={{
          base: "34px",
          md: "100%",
        }}
        height={{
          base: "34px",
          md: "100%",
        }}
        onClick={onOpen}
      >
        <MdOutlineLanguage />
        <Text
          ml={2}
          mr={3}
          as="span"
          display={{
            base: "none",
            md: "block",
          }}
        >
          {formatMessage(selectedLanguage.message)}
        </Text>
        <Box
          display={{
            base: "none",
            md: "block",
          }}
        >
          <FaChevronDown fontSize="0.6em" />
        </Box>
      </Flex>
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
  const selectedLocaleContext = useSelectedLocaleContext();

  const options = languageOptions.map((option) => ({
    ...option,
    label: option.ownLanguageLabel,
  }));

  const { register, watch } = useForm<z.infer<typeof localeSchema>>({
    defaultValues: {
      language: selectedLocaleContext.locale,
    },
  });
  const selectedValue = watch("language");

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="600px">
        <ModalBody px={16} pt={16}>
          <Heading fontSize="2xl" mb={4}>
            {formatMessage(messages.chooseLanguage)}
          </Heading>
          <Text mb={8}>
            {formatMessage(messages.description, {
              languageCount: languageOptions.length,
            })}
          </Text>

          <Select
            {...register("language", {
              onChange: (e) => {
                selectedLocaleContext.setLocale(e.target.value);
              },
            })}
            label="Language"
            options={options}
            value={selectedValue}
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
