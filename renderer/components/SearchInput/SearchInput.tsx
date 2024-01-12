import { SearchIcon } from "@chakra-ui/icons";
import {
  InputGroup,
  InputLeftElement,
  Input,
  InputProps,
} from "@chakra-ui/react";
import { defineMessages, useIntl } from "react-intl";

const messages = defineMessages({
  search: {
    defaultMessage: "Search",
  },
});

type Props = {
  onChange: InputProps["onChange"];
};

export function SearchInput({ onChange }: Props) {
  const { formatMessage } = useIntl();

  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <SearchIcon color="black" _dark={{ color: "white" }} />
      </InputLeftElement>
      <Input
        type="text"
        placeholder={formatMessage(messages.search)}
        onChange={onChange}
      />
    </InputGroup>
  );
}
