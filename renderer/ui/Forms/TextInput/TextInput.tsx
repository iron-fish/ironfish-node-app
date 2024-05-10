import { Box, HStack, Input, InputProps } from "@chakra-ui/react";
import { ReactNode, forwardRef } from "react";

import { FormField, FormFieldProps } from "../FormField/FormField";

type FormFieldPassthrough = Pick<
  FormFieldProps,
  "label" | "error" | "icon" | "triggerProps"
>;

export type TextInputProps = FormFieldPassthrough &
  Omit<InputProps, "type" | "placeholder"> & {
    type?: "text" | "number";
    rightElement?: ReactNode;
  };

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    { label, error, icon, triggerProps, type = "text", rightElement, ...rest },
    ref,
  ) {
    return (
      <FormField
        label={label}
        error={error}
        icon={icon}
        triggerProps={triggerProps}
      >
        <HStack>
          <Input
            type={type}
            variant="unstyled"
            placeholder=" "
            ref={ref}
            {...rest}
          />
          <Box>{rightElement}</Box>
        </HStack>
      </FormField>
    );
  },
);
