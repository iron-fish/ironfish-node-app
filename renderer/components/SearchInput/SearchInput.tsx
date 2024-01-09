import { SearchIcon } from "@chakra-ui/icons";
import {
  InputGroup,
  InputLeftElement,
  Input,
  InputProps,
} from "@chakra-ui/react";

type Props = {
  onChange: InputProps["onChange"];
};

export function SearchInput({ onChange }: Props) {
  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <SearchIcon color="black" _dark={{ color: "white" }} />
      </InputLeftElement>
      <Input type="text" placeholder="Search" onChange={onChange} />
    </InputGroup>
  );
}
