import { Input, InputProps, Textarea, TextareaProps } from "@chakra-ui/react";
import { forwardRef } from "react";

import { FormField, FormFieldProps } from "../FormField/FormField";

type FormFieldPassthrough = Pick<
  FormFieldProps,
  "label" | "error" | "icon" | "triggerProps"
>;

type AsTextarea = FormFieldPassthrough &
  Omit<TextareaProps, "type"> & {
    type?: "textarea";
  };

type AsInput = FormFieldPassthrough &
  Omit<InputProps, "type"> & {
    type?: "text";
  };

type Props = AsTextarea | AsInput;

export const TextInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  Props
>(function TextInput(props, ref) {
  if (props.type === "textarea") {
    const { label, error, icon, triggerProps, type, ...rest } =
      props as AsTextarea;
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
  }

  const {
    label,
    error,
    icon,
    triggerProps,
    type = "text",
    ...rest
  } = props as AsInput;

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
