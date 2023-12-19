import { TriangleDownIcon } from "@chakra-ui/icons";
import {
  HStack,
  InputGroup,
  InputRightElement,
  Input,
  Text,
  forwardRef,
  InputGroupProps,
} from "@chakra-ui/react";
import { ReactNode } from "react";

type Props = InputGroupProps & {
  label: ReactNode;
  value: ReactNode;
};

export const DropdownTrigger = forwardRef<Props, "div">(
  function DropdownTrigger({ label, value, ...rest }: Props, ref) {
    return (
      <InputGroup ref={ref} {...rest}>
        <Input
          as="button"
          borderColor="black"
          _hover={{ borderColor: "black" }}
          _dark={{
            borderColor: "white",
            _hover: {
              borderColor: "white",
            },
          }}
        >
          <HStack whiteSpace="nowrap">
            <Text opacity="0.8">{label}:</Text>
            <Text>{value}</Text>
          </HStack>
        </Input>
        <InputRightElement pointerEvents="none">
          <TriangleDownIcon
            fontSize="0.7rem"
            color="black"
            _dark={{ color: "white" }}
          />
        </InputRightElement>
      </InputGroup>
    );
  },
);
