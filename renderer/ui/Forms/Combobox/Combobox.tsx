import {
  VStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Box,
  Text,
  useMergeRefs,
} from "@chakra-ui/react";
import {
  ChangeEventHandler,
  FocusEventHandler,
  forwardRef,
  useCallback,
  useRef,
  useState,
} from "react";
import { UseFormSetValue } from "react-hook-form";

import { COLORS } from "@/ui/colors";

import { TextInput, TextInputProps } from "../TextInput/TextInput";

type Options = Array<{
  label:
    | string
    | {
        main: string;
        sub: string;
      };
  value: string;
}>;

type Props = TextInputProps & {
  value: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>;
  options: Options | undefined;
};

const variants = {
  exit: {
    opacity: 0,
    scale: 1,
    transition: {
      duration: 0,
    },
  },
  enter: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0,
    },
  },
};

function filterOptions(options: Options | undefined, value: string) {
  if (!options) return [];

  const lowercasedValue = value.toLowerCase();

  return options.filter((option) => {
    if (typeof option.label === "string") {
      return option.label.toLowerCase().includes(lowercasedValue);
    }
    return (
      option.label.main.toLowerCase().includes(lowercasedValue) ||
      option.label.sub.toLowerCase().includes(lowercasedValue) ||
      option.value.toLowerCase().includes(lowercasedValue)
    );
  });
}

export const Combobox = forwardRef<HTMLInputElement, Props>(function Combobox(
  { options = [], value, setValue, ...rest },
  ref,
) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>();
  const mergedRefs = useMergeRefs(inputRef, ref);

  const [shouldFilterSearch, setShouldFilterSearch] = useState(false);
  const filteredOptions = filterOptions(
    options,
    shouldFilterSearch ? value : "",
  );

  const onFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  const onBlur = useCallback<FocusEventHandler<HTMLInputElement>>(
    (arg) => {
      rest.onBlur?.(arg);
      setIsOpen(false);
      setShouldFilterSearch(false);
    },
    [rest],
  );

  const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      rest.onChange?.(e);
      setShouldFilterSearch(true);
    },
    [rest],
  );

  return (
    <Popover
      returnFocusOnClose={false}
      isOpen={filteredOptions.length > 0 && isOpen}
      placement="bottom"
      closeOnBlur={false}
      gutter={4}
      autoFocus={false}
      matchWidth
    >
      <PopoverTrigger>
        <Box>
          <TextInput
            ref={mergedRefs}
            {...rest}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={onChange}
          />
        </Box>
      </PopoverTrigger>
      <PopoverContent width="100%" overflow="hidden" variants={variants}>
        <PopoverBody p={0}>
          {filteredOptions.map((option, i) => (
            <Box
              as="button"
              type="button"
              display="block"
              w="100%"
              textAlign="left"
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              onClick={() => {
                if (!rest.name) throw new Error("No name provided to Combobox");
                setValue(rest.name, option.value);
                setIsOpen(false);
                inputRef.current?.blur();
              }}
              px={4}
              py={3}
              key={i}
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
              {typeof option.label === "string" ? (
                <Text fontSize="md">{option.label}</Text>
              ) : (
                <VStack alignItems="stretch">
                  <Text fontSize="md">{option.label.main}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {option.label.sub}
                  </Text>
                </VStack>
              )}
            </Box>
          ))}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
});
