import { Input, InputProps } from "@chakra-ui/react";
import { forwardRef } from "react";

import { FormField, FormFieldProps } from "../FormField/FormField";

type FormFieldPassthrough = Pick<
  FormFieldProps,
  "label" | "error" | "icon" | "triggerProps"
>;

export type TextInputProps = FormFieldPassthrough &
  Omit<InputProps, "type" | "placeholder"> & {
    type?: "text" | "number";
  };

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    { label, error, icon, triggerProps, type = "text", ...rest },
    ref,
  ) {
    return (
      <FormField
        label={label}
        error={error}
        icon={icon}
        triggerProps={triggerProps}
      >
        <Input
          type={type}
          variant="unstyled"
          placeholder=" "
          ref={ref}
          {...rest}
        />
      </FormField>
    );
  },
);
