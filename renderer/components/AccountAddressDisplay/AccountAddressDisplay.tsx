import { CopyIcon } from "@chakra-ui/icons";
import { Text, Flex, HStack, Input } from "@chakra-ui/react";
import { useCallback } from "react";
import { defineMessages, useIntl } from "react-intl";
import { useCopyToClipboard } from "usehooks-ts";

import { COLORS } from "@/ui/colors";
import { FormField, FormFieldProps } from "@/ui/Forms/FormField/FormField";
import { useIFToast } from "@/ui/Toast/Toast";

const messages = defineMessages({
  addressLabel: {
    defaultMessage: "Public Address",
  },
  copyButton: {
    defaultMessage: "Copy",
  },
  copiedMessage: {
    defaultMessage: "Address copied to clipboard",
  },
});

type Props = {
  address: string;
};

export function AccountAddressDisplay({ address }: Props) {
  const [_, copyToClipboard] = useCopyToClipboard();
  const toast = useIFToast();
  const { formatMessage } = useIntl();

  const handleCopy = useCallback(() => {
    copyToClipboard(address);
    toast({
      message: formatMessage(messages.copiedMessage),
    });
  }, [address, copyToClipboard, toast, formatMessage]);

  return (
    <Flex>
      <FormField
        label={formatMessage(messages.addressLabel)}
        flexGrow={1}
        triggerProps={
          {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          } as FormFieldProps["triggerProps"]
        }
      >
        <Input isReadOnly type="text" variant="unstyled" value={address} />
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
          borderColor: COLORS.WHITE,
        }}
      >
        <Text fontSize="md" as="span" color={COLORS.LINK}>
          {formatMessage(messages.copyButton)}
        </Text>
        <CopyIcon />
      </HStack>
    </Flex>
  );
}
