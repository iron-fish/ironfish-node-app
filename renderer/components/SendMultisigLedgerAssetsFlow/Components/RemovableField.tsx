import { CloseIcon } from "@chakra-ui/icons";
import { Flex, HStack, Input } from "@chakra-ui/react";

import { COLORS } from "@/ui/colors";
import { FormField } from "@/ui/Forms/FormField/FormField";

type Props = {
  value: string;
  label: string;
  onRemove: () => void;
  onChange: (value: string) => void;
};

export function RemovableField({ value, label, onChange, onRemove }: Props) {
  return (
    <Flex>
      <FormField
        label={label}
        flexGrow={1}
        triggerProps={{
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
      >
        <Input
          type="text"
          variant="unstyled"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
        />
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
        onClick={onRemove}
        cursor="pointer"
        borderColor={COLORS.BLACK}
        color={COLORS.LINK}
        _dark={{
          bg: COLORS.DARK_MODE.GRAY_DARK,
          borderColor: COLORS.DARK_MODE.GRAY_MEDIUM,
        }}
      >
        <CloseIcon color={COLORS.RED} />
      </HStack>
    </Flex>
  );
}
