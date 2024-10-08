import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { Box, Button, HStack, Text, IconButton, Flex } from "@chakra-ui/react";
import Image from "next/image";
import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { defineMessages, useIntl } from "react-intl";

import { COLORS } from "@/ui/colors";
import { TextInput } from "@/ui/Forms/TextInput/TextInput";
import { sliceToUtf8Bytes } from "@/utils/sliceToUtf8Bytes";

import { MAX_MEMO_SIZE } from "../../transactionSchema";
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

export function MemoInput() {
  const { formatMessage } = useIntl();
  const [showMemoInput, setShowMemoInput] = useState(false);
  const { control, watch } = useFormContext();
  const memo = watch("memo");

  const renderMemoContent = () => {
    if (!showMemoInput && !memo) {
      return (
        <Button
          onClick={() => setShowMemoInput(true)}
          width="fit-content"
          variant="ghost"
          size="sm"
        >
          <Text color={COLORS.VIOLET}>+ {formatMessage(messages.addMemo)}</Text>
        </Button>
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
                icon={
                  <HStack gap={2}>
                    <IconButton
                      borderRadius="full"
                      color="white"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        field.onChange("");
                        setShowMemoInput(false);
                      }}
                      bg={COLORS.RED}
                      aria-label="Clear memo"
                      icon={<CloseIcon />}
                    />
                    <IconButton
                      variant="ghost"
                      borderRadius="full"
                      color="white"
                      size="sm"
                      bg={COLORS.GREEN_DARK}
                      onClick={() => setShowMemoInput(false)}
                      aria-label="Save memo"
                      isDisabled={!field.value}
                      _disabled={{
                        bg: COLORS.GREEN_DARK,
                        opacity: 0.4,
                        cursor: "not-allowed",
                        _hover: { bg: COLORS.GREEN_DARK },
                      }}
                      icon={<CheckIcon />}
                    />
                  </HStack>
                }
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    sliceToUtf8Bytes(e.target.value, MAX_MEMO_SIZE),
                  )
                }
              />
            )}
          />
        </Box>
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
              onClick={() => setShowMemoInput(true)}
            >
              <Image src={edit} alt="edit memo" />
            </Button>
          </HStack>
        </Flex>
      );
    }

    return null;
  };

  return <>{renderMemoContent()}</>;
}
