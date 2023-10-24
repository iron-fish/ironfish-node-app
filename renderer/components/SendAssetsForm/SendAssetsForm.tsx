import {
  Input,
  Box,
  VStack,
  Text,
  chakra,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { COLORS } from "@/ui/colors";

type FormFieldProps = { children: ReactNode; label: string; error?: string };

function FormField({ children, error, label }: FormFieldProps) {
  return (
    <VStack>
      <Box
        as="label"
        border="1px solid"
        borderColor={error ? COLORS.RED : COLORS.DEEP_BLUE}
        borderRadius={4}
        w="100%"
        px={6}
        py={3}
      >
        <Text fontSize="sm" color={COLORS.GRAY_MEDIUM}>
          {label}
        </Text>
        {children}
      </Box>
      {error && (
        <Text color={COLORS.RED} fontSize="sm" textAlign="left" w="100%">
          {error}
        </Text>
      )}
    </VStack>
  );
}

const schema = z.object({
  fromAccount: z.string(),
  asset: z.string(),
  amount: z.number(),
  to: z.string(),
  fee: z.number(),
  memo: z.string().optional(),
});

export function SendAssetsForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <chakra.form
      maxW="592px"
      onSubmit={handleSubmit((data) => console.log(data))}
    >
      <VStack gap={4} alignItems="stretch">
        <FormField label="From">
          <Menu>
            <MenuButton>Primary Account</MenuButton>
            <MenuList>
              <MenuItem>Primary Account</MenuItem>
              <MenuItem>Other Account</MenuItem>
            </MenuList>
          </Menu>
        </FormField>

        <FormField
          label="Memo (32 characters max)"
          error={errors.memo && "This field is required"}
        >
          <Input
            type="text"
            variant="unstyled"
            fontSize=""
            {...register("memo", { required: true })}
          />
        </FormField>
      </VStack>
    </chakra.form>
  );
}
