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
  useToast,
} from "@chakra-ui/react";
import { get } from "lodash-es";
import { useCallback, type ClipboardEvent, ChangeEvent } from "react";
import { RiEyeCloseLine, RiEyeLine, RiFileCopyLine } from "react-icons/ri";
import { useCopyToClipboard, useToggle } from "usehooks-ts";

import { COLORS } from "@/ui/colors";
import { useHasGroupBlur } from "@/utils/formUtils";
import { MergeProps } from "@/utils/react";

import { FormField, FormFieldProps } from "../FormField/FormField";

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
  const toast = useToast();

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (!onChange) return;

      const number = get(e, "target.dataset.number") as unknown;
      if (typeof number !== "string") {
        throw new Error("data-number not found in mnemonic phrase input");
      }
      const index = parseInt(number, 10) - 1;
      const nextValues = phrase
        .toSpliced(index, 1, e.target.value)
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

      const words = e.clipboardData.getData("text").trim().split(/\s+/g);
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
          <Text fontSize="sm" color={COLORS.GRAY_MEDIUM}>
            Mnemonic Phrase
          </Text>
          {readOnly && (
            <Box
              cursor="pointer"
              padding={2}
              onClick={() => {
                copyToClipboard(phrase.join(" "));
                toast({
                  title: "Mnemonic phrase copied to clipboard!",
                  status: "info",
                  position: "bottom-left",
                  duration: 4000,
                  isClosable: true,
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
                  placeholder="Empty"
                  _dark={{
                    borderColor:
                      hasBlur && !value
                        ? COLORS.RED
                        : COLORS.DARK_MODE.GRAY_LIGHT,
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
