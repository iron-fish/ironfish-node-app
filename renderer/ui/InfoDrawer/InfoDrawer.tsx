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
          // position="fixed"
          // right={4}
          rounded="full"
          // top={4}
          variant="outline"
          // zIndex="overlay"
        />
      ) : (
        <PillButton variant="inverted" gap={2} onClick={onOpen}>
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
