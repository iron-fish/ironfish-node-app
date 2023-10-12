import { CopyIcon } from "@chakra-ui/icons";
import { Text, TextProps, useToast } from "@chakra-ui/react";
import { useCopyToClipboard } from "usehooks-ts";

import { COLORS } from "@/ui/colors";
import { formatAddress } from "@/utils/addressUtils";

type Props = TextProps & {
  address: string;
};

export function CopyAddress({ address, ...rest }: Props) {
  const [_, copyToClipboard] = useCopyToClipboard();
  const toast = useToast();
  return (
    <Text
      as="button"
      onClick={(e) => {
        e.preventDefault();
        copyToClipboard(address);
        toast({
          description: "Address copied to clipboard",
          status: "success",
          duration: 2000,
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
      {formatAddress(address)}
      <CopyIcon ml={1} transform="translateY(-1px)" />
    </Text>
  );
}
