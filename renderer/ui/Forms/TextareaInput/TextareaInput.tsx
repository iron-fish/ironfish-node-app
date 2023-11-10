import { Textarea, TextareaProps } from "@chakra-ui/react";
import { forwardRef } from "react";

import { FormField, FormFieldProps } from "../FormField/FormField";

type FormFieldPassthrough = Pick<
  FormFieldProps,
  "label" | "error" | "icon" | "triggerProps"
>;

type Props = FormFieldPassthrough &
  Omit<TextareaProps, "type"> & {
    type?: "textarea";
  };

export const TextareaInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  Props
>(function TextareaInput(
  { label, error, icon, triggerProps, type, ...rest },
  ref,
) {
  return (
    <FormField
      label={label}
      error={error}
      icon={icon}
      triggerProps={triggerProps}
    >
      <Textarea
        my={1}
        type={type}
        rows={8}
        variant="unstyled"
        ref={ref}
        {...rest}
      />
    </FormField>
  );
});
