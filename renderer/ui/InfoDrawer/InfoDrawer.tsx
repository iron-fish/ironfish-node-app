import { InfoOutlineIcon } from "@chakra-ui/icons";
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  useDisclosure,
  Box,
  useBreakpointValue,
  IconButton,
} from "@chakra-ui/react";
import React from "react";
import { defineMessages, useIntl } from "react-intl";

import { PillButton } from "@/ui/PillButton/PillButton";

const messages = defineMessages({
  details: {
    defaultMessage: "Details",
  },
});

interface InfoButtonProps {
  children: React.ReactNode;
}

const InfoButton: React.FC<InfoButtonProps> = ({ children }) => {
  const { formatMessage } = useIntl();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const displayMode = useBreakpointValue({
    base: "mobile",
    md: "tablet",
    lg: "desktop",
  });

  if (displayMode === "desktop") {
    return <Box>{children}</Box>;
  }

  return (
    <>
      {displayMode === "mobile" ? (
        <IconButton
          icon={<InfoOutlineIcon />}
          aria-label={formatMessage(messages.details)}
          onClick={onOpen}
          rounded="full"
          variant="outline"
          _hover={{
            bg: "rgba(0, 0, 0, 0.05)",
          }}
          // position="fixed"
          // right={4}
          // top={4}
          // zIndex="overlay"
        />
      ) : (
        <PillButton variant="inverted" borderWidth={1} gap={2} onClick={onOpen}>
          <InfoOutlineIcon />
          {formatMessage(messages.details)}
        </PillButton>
      )}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent px={4} pt={16}>
          <DrawerCloseButton />
          <DrawerBody>{children}</DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default InfoButton;
