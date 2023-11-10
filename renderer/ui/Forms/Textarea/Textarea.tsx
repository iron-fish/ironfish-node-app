import { Input, InputProps } from "@chakra-ui/react";
import { forwardRef } from "react";

import { FormField, FormFieldProps } from "../FormField/FormField";

type Props = Pick<FormFieldProps, "label" | "error" | "icon" | "triggerProps"> &
  Omit<InputProps, "type"> & {
    type?: InputProps["type"] | "textarea";
  };

export const TextInput = forwardRef<HTMLInputElement, Props>(function TextInput(
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
      <Input type={type} variant="unstyled" ref={ref} {...rest} />
    </FormField>
  );
});
