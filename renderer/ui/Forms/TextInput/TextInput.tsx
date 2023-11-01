import { Input, InputProps } from "@chakra-ui/react";
import { forwardRef } from "react";

import { FormField, FormFieldProps } from "../FormField/FormField";

type Props = FormFieldProps & InputProps;

export const TextInput = forwardRef<HTMLInputElement, Props>(function TextInput(
  { label, error, icon, triggerProps, ...rest },
  ref,
) {
  return (
    <FormField
      label={label}
      error={error}
      icon={icon}
      triggerProps={triggerProps}
    >
      <Input type="text" variant="unstyled" ref={ref} {...rest} />
    </FormField>
  );
});
