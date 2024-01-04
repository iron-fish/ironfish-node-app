import { CopyIcon } from "@chakra-ui/icons";
import { Text, TextProps } from "@chakra-ui/react";
import { useCopyToClipboard } from "usehooks-ts";

import { COLORS } from "@/ui/colors";
import { useIFToast } from "@/ui/Toast/Toast";
import { truncateString } from "@/utils/truncateString";

type Props = TextProps & {
  address: string;
  truncate?: boolean;
};

export function CopyAddress({ address, truncate = true, ...rest }: Props) {
  const [_, copyToClipboard] = useCopyToClipboard();
  const toast = useIFToast();
  return (
    <Text
      as="button"
      onClick={(e) => {
        e.preventDefault();
        copyToClipboard(address);
        toast({
          message: "Address copied to clipboard",
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
      {truncate ? truncateString(address) : address}
      <CopyIcon ml={1} transform="translateY(-1px)" />
    </Text>
  );
}
