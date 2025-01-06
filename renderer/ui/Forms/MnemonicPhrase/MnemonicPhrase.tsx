import {
  Box,
  Flex,
  Grid,
  GridItem,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from "@chakra-ui/react";
import { get } from "lodash-es";
import { useCallback, type ClipboardEvent, ChangeEvent } from "react";
import { RiEyeCloseLine, RiEyeLine, RiFileCopyLine } from "react-icons/ri";
import { defineMessages, useIntl } from "react-intl";
import { useCopyToClipboard, useToggle } from "usehooks-ts";

import { COLORS } from "@/ui/colors";
import { useIFToast } from "@/ui/Toast/Toast";
import { useHasGroupBlur } from "@/utils/formUtils";
import { formatMnemonicWord } from "@/utils/mnemonic";
import { MergeProps } from "@/utils/react";

import { FormField, FormFieldProps } from "../FormField/FormField";

const messages = defineMessages({
  mnemonicPhrase: {
    defaultMessage: "Mnemonic Phrase",
  },
  mnemonicPhraseCopied: {
    defaultMessage: "Mnemonic phrase copied to clipboard!",
  },
  mnemonicPhrasePlaceholder: {
    defaultMessage: "Empty",
  },
});

export const PHRASE_ITEM_COUNT = 24;
export const EMPTY_PHRASE_ARRAY = Array.from(
  { length: PHRASE_ITEM_COUNT },
  () => "",
);

type Props = MergeProps<
  {
    phrase: Array<string>;
    readOnly?: boolean;
    onChange?: (phrase: Array<string>) => void;
    defaultVisible?: boolean;
    error?: string | null;
  },
  Omit<FormFieldProps, "label">
>;

export function splitMnemonicPhrase(phrase: string) {
  return phrase.split(/\s+/).map((part) => part.trim());
}

export function MnemonicPhrase({
  phrase,
  readOnly,
  onChange,
  defaultVisible,
  error,
  ...rest
}: Props) {
  const { hasBlur, handleGroupFocus, handleGroupBlur } = useHasGroupBlur();
  const [isHidden, toggleIsHidden] = useToggle(defaultVisible ? false : true);
  const [_, copyToClipboard] = useCopyToClipboard();
  const toast = useIFToast();
  const { formatMessage } = useIntl();

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!onChange) return;

      const number = get(e, "target.dataset.number") as unknown;
      if (typeof number !== "string") {
        throw new Error("data-number not found in mnemonic phrase input");
      }
      const index = parseInt(number, 10) - 1;
      const nextValues = phrase
        .toSpliced(index, 1, formatMnemonicWord(e.target.value))
        .slice(0, PHRASE_ITEM_COUNT);

      onChange(nextValues);
    },
    [onChange, phrase],
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
      if (!onChange) return;

      e.preventDefault();

      const number = get(e, "target.dataset.number") as unknown;

      if (typeof number !== "string") {
        throw new Error("data-number not found in mnemonic phrase input");
      }

      const clipboardText = e.clipboardData.getData("text");

      const words = clipboardText.split(/\s+/g).map(formatMnemonicWord);

      const index = parseInt(number, 10) - 1;

      if (words.length === PHRASE_ITEM_COUNT) {
        onChange(words);
        return;
      }

      const nextValues = phrase
        .toSpliced(index, words.length, ...words)
        .slice(0, PHRASE_ITEM_COUNT);

      onChange(nextValues);
    },
    [onChange, phrase],
  );

  return (
    <FormField
      {...rest}
      error={hasBlur && error ? error : undefined}
      label={
        <HStack>
          <Text
            fontSize="sm"
            color={COLORS.GRAY_MEDIUM}
            _dark={{ color: COLORS.DARK_MODE.GRAY_LIGHT }}
          >
            {formatMessage(messages.mnemonicPhrase)}
          </Text>
          {readOnly && (
            <Box
              cursor="pointer"
              padding={2}
              onClick={() => {
                copyToClipboard(phrase.join(" "));
                toast({
                  message: formatMessage(messages.mnemonicPhraseCopied),
                });
              }}
            >
              <RiFileCopyLine />
            </Box>
          )}
        </HStack>
      }
      actions={
        <HStack>
          <Box
            padding={2}
            cursor="pointer"
            onClick={() => {
              toggleIsHidden();
            }}
          >
            {isHidden ? <RiEyeCloseLine /> : <RiEyeLine />}
          </Box>
        </HStack>
      }
    >
      <Grid
        as="fieldset"
        onFocus={handleGroupFocus}
        onBlur={handleGroupBlur}
        templateColumns={{
          base: "repeat(3, 1fr)",
          sm: "repeat(4, 1fr)",
        }}
        gap={2}
        mt={2}
      >
        {EMPTY_PHRASE_ARRAY.map((_, i) => {
          const num = i + 1;
          const value = isHidden ? "••••••••" : phrase[i] ?? "";
          return (
            <GridItem key={i}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <Flex
                    w="25px"
                    h="25px"
                    bg={COLORS.GRAY_LIGHT}
                    color={COLORS.GRAY_MEDIUM}
                    _dark={{
                      bg: COLORS.DARK_MODE.GRAY_DARK,
                      color: COLORS.WHITE,
                    }}
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="2px"
                  >
                    {num}
                  </Flex>
                </InputLeftElement>
                <Input
                  data-number={num}
                  readOnly={readOnly}
                  type={isHidden ? "password" : "text"}
                  value={value}
                  onChange={handleChange}
                  onPaste={handlePaste}
                  borderColor={hasBlur && !value ? COLORS.RED : COLORS.BLACK}
                  placeholder={formatMessage(
                    messages.mnemonicPhrasePlaceholder,
                  )}
                  _dark={{
                    bg: COLORS.DARK_MODE.GRAY_MEDIUM,
                    borderColor: hasBlur && !value ? COLORS.RED : "transparent",
                  }}
                  _hover={{
                    borderColor: COLORS.BLACK,
                  }}
                />
              </InputGroup>
            </GridItem>
          );
        })}
      </Grid>
    </FormField>
  );
}
