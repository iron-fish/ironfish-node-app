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
import { MdInfo } from "react-icons/md";
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
    base: "sm",
    md: "md",
    lg: "lg",
  });

  // Large display mode shows no drawer
  if (displayMode === "lg") {
    return <Box>{children}</Box>;
  }

  return (
    <>
      {displayMode === "sm" ? (
        <IconButton
          icon={<MdInfo />}
          aria-label={formatMessage(messages.details)}
          onClick={onOpen}
          rounded="full"
          variant="outline"
          borderColor="black"
          _hover={{
            bg: "rgba(0, 0, 0, 0.05)",
          }}
        />
      ) : (
        <PillButton
          size="sm"
          height="fit-content"
          variant="inverted"
          borderWidth={1}
          gap={2}
          onClick={onOpen}
        >
          <MdInfo />
          {formatMessage(messages.details)}
        </PillButton>
      )}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent px={4} pt={16}>
          <DrawerCloseButton
            mt={1}
            borderRadius="full"
            borderWidth={1}
            borderColor="black"
          />
          <DrawerBody>{children}</DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default InfoButton;
