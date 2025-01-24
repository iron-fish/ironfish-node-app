import { ChevronDownIcon } from "@chakra-ui/icons";
import { Box, HStack } from "@chakra-ui/react";
import * as RadixSelect from "@radix-ui/react-select";
import React, { ComponentProps, ReactNode, forwardRef, useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { Simplify } from "type-fest";

import { COLORS } from "@/ui/colors";

import styles from "./select.module.css";
import { FormField, FormFieldProps } from "../FormField/FormField";

type SelectOption = {
  label: ReactNode;
  value: string;
  disabled?: boolean;
  icon?: ReactNode;
};

export type SelectRootProps = Simplify<ComponentProps<typeof RadixSelect.Root>>;

type Props = FormFieldProps &
  Omit<SelectRootProps, "onValueChange"> & {
    name: string;
    options: Array<SelectOption>;
    onChange: UseFormRegisterReturn["onChange"];
    triggerProps?: FormFieldProps["triggerProps"];
    icon?: ReactNode;
  };

export const Select = forwardRef<typeof RadixSelect.Trigger, Props>(
  function Select(
    {
      label,
      error,
      options,
      onChange,
      name,
      triggerProps,
      renderChildren,
      icon,
      ...rest
    },
    ref,
  ) {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <RadixSelect.Root
        name={name}
        onOpenChange={(nextValue) => setIsOpen(nextValue)}
        onValueChange={(nextValue) => {
          onChange({ target: { name, value: nextValue } });
        }}
        {...rest}
      >
        <FormField
          label={label}
          error={error}
          icon={
            <HStack gap={3}>
              {icon}
              <ChevronDownIcon
                transform={`rotate(${isOpen ? "180" : "0"}deg)`}
                boxSize={4}
                mr={2}
                color={COLORS.GRAY_MEDIUM}
              />
            </HStack>
          }
          triggerProps={{
            as: RadixSelect.Trigger,
            className: styles.SelectTrigger,
            ref,
            textAlign: "inherit",
            ...triggerProps,
          }}
          renderChildren={renderChildren}
        >
          <HStack justifyContent="space-between">
            <RadixSelect.Value
              placeholder="Select..."
              className={styles.SelectValue}
            />
          </HStack>
        </FormField>
        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={5}
            className={styles.SelectContent}
            style={{
              zIndex: 9999,
            }}
          >
            <RadixSelect.Viewport>
              <Box
                bg="white"
                border="1px solid black"
                borderRadius={4}
                overflow="hidden"
                _dark={{
                  bg: COLORS.DARK_MODE.GRAY_DARK,
                  color: COLORS.WHITE,
                  borderColor: COLORS.WHITE,
                }}
              >
                {options.map(({ label, value, icon, disabled }, i) => (
                  <Box
                    key={i}
                    cursor={disabled ? "default" : "pointer"}
                    opacity={disabled ? 0.5 : 1}
                    _hover={
                      disabled
                        ? undefined
                        : {
                            bg: COLORS.GRAY_LIGHT,
                          }
                    }
                    _dark={
                      disabled
                        ? undefined
                        : {
                            _hover: {
                              bg: COLORS.DARK_MODE.GRAY_MEDIUM,
                            },
                          }
                    }
                    _focusWithin={{
                      bg: COLORS.GRAY_LIGHT,
                      _dark: {
                        bg: COLORS.DARK_MODE.GRAY_MEDIUM,
                      },
                    }}
                  >
                    <RadixSelect.Item value={value} disabled={disabled}>
                      <HStack px={4} py={3} justifyContent="space-between">
                        {typeof label === "string" ? (
                          <RadixSelect.ItemText>{label}</RadixSelect.ItemText>
                        ) : (
                          label
                        )}
                        {icon}
                      </HStack>
                    </RadixSelect.Item>
                  </Box>
                ))}
              </Box>
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    );
  },
);
