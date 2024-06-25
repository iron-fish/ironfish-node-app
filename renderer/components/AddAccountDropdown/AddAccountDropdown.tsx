import { Menu, Button, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";

import { PillButton } from "@/ui/PillButton/PillButton";

export function AddAccountDropdown() {
  return (
    <Menu>
      <MenuButton as={Button}>Actions</MenuButton>
      <MenuList>
        <MenuItem onClick={() => {}}>Hello</MenuItem>
        <MenuItem onClick={() => {}}>Hello</MenuItem>
        <MenuItem onClick={() => {}}>Hello</MenuItem>
      </MenuList>
    </Menu>
  );
  return <PillButton>Add Account</PillButton>;
}
