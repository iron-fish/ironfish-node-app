import { TriangleDownIcon } from "@chakra-ui/icons";
import { Box } from "@chakra-ui/react";
import * as RadixSelect from "@radix-ui/react-select";
import React, { ComponentProps, ReactNode, forwardRef, useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { Simplify } from "type-fest";

import { COLORS } from "@/ui/colors";

import styles from "./select.module.css";
import { FormField, FormFieldProps } from "../FormField/FormField";

type SelectOption = { label: ReactNode; value: string };

type SelectRootProps = Simplify<ComponentProps<typeof RadixSelect.Root>>;

type Props = FormFieldProps &
  Omit<SelectRootProps, "onValueChange"> & {
    name: string;
    options: Array<SelectOption>;
    onChange: UseFormRegisterReturn["onChange"];
  };

export const Select = forwardRef<typeof RadixSelect.Trigger, Props>(
  function Select(
    { label, error, options, onChange, name, ...rest }: Props,
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
            <TriangleDownIcon
              transform={`rotate(${isOpen ? "180" : "0"}deg)`}
              boxSize={3}
              mr={6}
            />
          }
          triggerProps={{
            as: RadixSelect.Trigger,
            ref,
            textAlign: "inherit",
          }}
        >
          <RadixSelect.Value placeholder="Select..." />
        </FormField>
        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={5}
            className={styles.SelectContent}
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
                {options.map(({ label, value }, i) => (
                  <Box
                    key={i}
                    px={4}
                    py={3}
                    cursor="pointer"
                    _hover={{
                      bg: COLORS.GRAY_LIGHT,
                    }}
                    _dark={{
                      _hover: {
                        bg: COLORS.DARK_MODE.GRAY_MEDIUM,
                      },
                    }}
                  >
                    <RadixSelect.Item value={value} key={i}>
                      <RadixSelect.ItemText>{label}</RadixSelect.ItemText>
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
