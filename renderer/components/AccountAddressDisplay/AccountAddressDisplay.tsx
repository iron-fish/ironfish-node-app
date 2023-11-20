import { CopyIcon } from "@chakra-ui/icons";
import { Text, Flex, HStack, Input, useToast } from "@chakra-ui/react";
import { useCallback } from "react";
import { useCopyToClipboard } from "usehooks-ts";

import { COLORS } from "@/ui/colors";
import { FormField, FormFieldProps } from "@/ui/Forms/FormField/FormField";

type Props = {
  address: string;
};

export function AccountAddressDisplay({ address }: Props) {
  const [_, copyToClipboard] = useCopyToClipboard();
  const toast = useToast();

  const handleCopy = useCallback(() => {
    copyToClipboard(address);
    toast({
      description: "Address copied to clipboard",
      status: "success",
      duration: 2000,
    });
  }, [address, copyToClipboard, toast]);
  return (
    <Flex>
      <FormField
        label="Public Address"
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
          Copy
        </Text>
        <CopyIcon />
      </HStack>
    </Flex>
  );
}
