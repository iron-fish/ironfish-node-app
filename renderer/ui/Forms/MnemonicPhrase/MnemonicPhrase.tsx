import {
  Box,
  Flex,
  Grid,
  GridItem,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { useCallback } from "react";
import { RiEyeCloseLine, RiEyeLine } from "react-icons/ri";
import { useToggle } from "usehooks-ts";

import { COLORS } from "@/ui/colors";

import { FormField } from "../FormField/FormField";

const WORD_ITEMS = Array.from({ length: 24 }, (_, i) => i + 1);

type Props = {
  phrase: Array<string>;
  readOnly?: boolean;
};

export function MnemonicPhrase({ phrase, readOnly }: Props) {
  const [isHidden, toggleIsHidden] = useToggle(true);

  const handlePaste = useCallback((text: string, inputNumber: number) => {
    console.log({ text, inputNumber });
  }, []);

  return (
    <FormField
      label="Mnemonic Phrase"
      actions={
        <HStack>
          <Box
            as="button"
            onClick={() => {
              console.log("click");
              toggleIsHidden();
            }}
          >
            {isHidden ? <RiEyeCloseLine /> : <RiEyeLine />}
          </Box>
        </HStack>
      }
    >
      <Grid templateColumns="repeat(4, 1fr)" gap={2} mt={2}>
        {WORD_ITEMS.map((num, i) => {
          const value = phrase[i] ?? "";
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
                  onPaste={(event) => {
                    const text = event.clipboardData.getData("text");
                    handlePaste(text, num);
                  }}
                  borderColor={COLORS.BLACK}
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
