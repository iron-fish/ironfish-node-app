import { CopyIcon } from "@chakra-ui/icons";
import { Text, TextProps } from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";
import { useCopyToClipboard } from "usehooks-ts";

import { COLORS } from "@/ui/colors";
import { useIFToast } from "@/ui/Toast/Toast";
import { truncateString } from "@/utils/truncateString";

const messages = defineMessages({
  addressCopied: {
    defaultMessage: "Address copied to clipboard",
  },
  hashCopied: {
    defaultMessage: "Hash copied to clipboard",
  },
  default: {
    defaultMessage: "Copied to clipboard",
  },
});

type Props = TextProps & {
  text: string;
  parts?: 2 | 3;
  truncate?: boolean;
  messageType?: keyof typeof messages;
};

export function CopyToClipboard({
  text,
  parts = 3,
  truncate = true,
  messageType = "addressCopied",
  ...rest
}: Props) {
  const [_, copyToClipboard] = useCopyToClipboard();
  const toast = useIFToast();
  const { formatMessage } = useIntl();

  return (
    <Text
      as="button"
      onClick={(e) => {
        e.preventDefault();
        copyToClipboard(text);
        toast({
          message: formatMessage(messages[messageType]),
        });
      }}
      color={COLORS.GRAY_MEDIUM}
      _hover={{
        textDecoration: "underline",
      }}
      _dark={{
        color: COLORS.DARK_MODE.GRAY_LIGHT,
      }}
      {...rest}
    >
      {truncate ? truncateString(text, parts) : text}
      <CopyIcon
        color={COLORS.GRAY_MEDIUM}
        _dark={{ color: COLORS.DARK_MODE.GRAY_LIGHT }}
        ml={1}
        transform="translateY(-1px)"
      />
    </Text>
  );
}
