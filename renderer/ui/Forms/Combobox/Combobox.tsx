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
  FocusEventHandler,
  forwardRef,
  useCallback,
  useRef,
  useState,
} from "react";
import { UseFormSetValue } from "react-hook-form";

import { COLORS } from "@/ui/colors";

import { TextInput, TextInputProps } from "../TextInput/TextInput";

type Props = TextInputProps & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>;
  options:
    | Array<{
        label:
          | string
          | {
              main: string;
              sub: string;
            };
        value: string;
      }>
    | undefined;
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

export const Combobox = forwardRef<HTMLInputElement, Props>(function Combobox(
  { options = [], setValue, ...rest },
  ref,
) {
  const [isOpen, setIsOpen] = useState(false);
  const onFocus = useCallback(() => {
    setIsOpen(true);
  }, []);
  const onBlur = useCallback<FocusEventHandler<HTMLInputElement>>(
    (arg) => {
      rest.onBlur?.(arg);
      setIsOpen(false);
    },
    [rest],
  );

  const inputRef = useRef<HTMLInputElement>();
  const mergedRefs = useMergeRefs(inputRef, ref);
  return (
    <Popover
      returnFocusOnClose={false}
      isOpen={options.length > 0 && isOpen}
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
          />
        </Box>
      </PopoverTrigger>
      <PopoverContent width="100%" overflow="hidden" variants={variants}>
        <PopoverBody p={0}>
          {options.map((option, i) => (
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
