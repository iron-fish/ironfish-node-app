import { CloseIcon } from "@chakra-ui/icons";
import { Box, Button, HStack, Text, IconButton, Flex } from "@chakra-ui/react";
import Image from "next/image";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";

import { COLORS } from "@/ui/colors";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { sliceToUtf8Bytes } from "@/utils/sliceToUtf8Bytes";

import { MAX_MEMO_SIZE, TransactionFormData } from "../../transactionSchema";
import edit from "../icons/edit.svg";

const messages = defineMessages({
  memo: {
    defaultMessage: "Memo:",
  },
  addMemo: {
    defaultMessage: "Add Memo",
  },
  memoLabel: {
    defaultMessage: "Memo (32 characters max)",
  },
});
const MemoInput = () => {
  const { formatMessage } = useIntl();
  const [showMemoInput, setShowMemoInput] = useState(false);
  const { control, watch } = useFormContext<TransactionFormData>();
  const memo = watch("memo");

  if (!showMemoInput && !memo) {
    return (
      <Button
        onClick={() => setShowMemoInput(true)}
        width="fit-content"
        variant="ghost"
        px={0}
        size="sm"
        _hover={{
          bg: "transparent",
          textDecoration: "underline",
          textDecorationColor: COLORS.VIOLET,
        }}
      >
        <Text fontWeight={400} color={COLORS.VIOLET}>
          + {formatMessage(messages.addMemo)}
        </Text>
      </Button>
    );
  }

  if (!showMemoInput && memo) {
    return (
      <Flex flexDir="column" pt="4">
        <Text as="div" color={COLORS.GRAY_MEDIUM}>
          {formatMessage(messages.memo)}
        </Text>
        <HStack gap={2}>
          <Text fontSize="md">{memo}</Text>
          <Button
            variant="ghost"
            size="sm"
            px={1}
            onClick={() => setShowMemoInput(true)}
          >
            <Image src={edit} alt="edit memo" />
          </Button>
        </HStack>
      </Flex>
    );
  }

  if (showMemoInput) {
    return (
      <Box py={4} borderBottom="1.5px dashed #DEDFE2">
        <Controller
          name="memo"
          control={control}
          render={({ field, formState: { errors } }) => (
            <TextInput
              {...field}
              error={errors.memo?.message}
              label={formatMessage(messages.memoLabel)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && field.value) {
                  setShowMemoInput(false);
                }
              }}
              value={field.value ?? ""}
              onChange={(e) =>
                field.onChange(sliceToUtf8Bytes(e.target.value, MAX_MEMO_SIZE))
              }
              icon={
                <HStack gap={2}>
                  <IconButton
                    aria-label="Clear memo"
                    borderRadius="full"
                    color="white"
                    variant="ghost"
                    size="sm"
                    h={6}
                    minW={6}
                    w={6}
                    fontSize={8}
                    onClick={() => {
                      field.onChange("");
                      setShowMemoInput(false);
                    }}
                    bg={COLORS.RED}
                    _hover={{
                      opacity: 0.8,
                    }}
                    icon={<CloseIcon />}
                  />
                </HStack>
              }
            />
          )}
        />
      </Box>
    );
  }
};

export default MemoInput;
