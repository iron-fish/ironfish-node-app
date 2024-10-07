import { CopyIcon } from "@chakra-ui/icons";
import { Flex, HStack, Input, Text } from "@chakra-ui/react";
import { useCallback } from "react";
import { defineMessages, useIntl } from "react-intl";
import { useCopyToClipboard } from "usehooks-ts";

import { COLORS } from "@/ui/colors";
import { FormField, FormFieldProps } from "@/ui/Forms/FormField/FormField";
import { useIFToast } from "@/ui/Toast/Toast";

const messages = defineMessages({
  copyButton: {
    defaultMessage: "Copy",
  },
  copiedMessage: {
    defaultMessage: "Address copied to clipboard",
  },
});

type Props = {
  value: string;
  label: string;
};

export function CopyField({ value, label }: Props) {
  const [_, copyToClipboard] = useCopyToClipboard();
  const toast = useIFToast();
  const { formatMessage } = useIntl();

  const handleCopy = useCallback(() => {
    copyToClipboard(value);
    toast({
      message: formatMessage(messages.copiedMessage),
    });
  }, [value, copyToClipboard, toast, formatMessage]);

  return (
    <Flex>
      <FormField
        label={label}
        flexGrow={1}
        triggerProps={
          {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          } as FormFieldProps["triggerProps"]
        }
      >
        <Input isReadOnly type="text" variant="unstyled" value={value} />
      </FormField>
      <HStack
        as="button"
        alignItems="center"
        border="1px solid"
        borderLeftWidth={0}
        pl={5}
        pr={4}
        borderTopRightRadius={4}
        borderBottomRightRadius={4}
        onClick={handleCopy}
        cursor="pointer"
        borderColor={COLORS.BLACK}
        color={COLORS.LINK}
        _dark={{
          bg: COLORS.DARK_MODE.GRAY_DARK,
          borderColor: COLORS.DARK_MODE.GRAY_MEDIUM,
        }}
      >
        <Text
          fontSize="md"
          as="span"
          color={COLORS.LINK}
          _dark={{ color: COLORS.LINK }}
        >
          {formatMessage(messages.copyButton)}
        </Text>
        <CopyIcon />
      </HStack>
    </Flex>
  );
}
