import {
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  VStack,
  Box,
  Text,
  HStack,
  Grid,
  GridItem,
  Flex,
  ModalFooter,
} from "@chakra-ui/react";
import Image, { StaticImageData } from "next/image";
import { RxExternalLink } from "react-icons/rx";

import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";
import { BridgeArrows } from "@/ui/SVGs/BridgeArrows";

import chainportIcon from "./assets/chainport-icon.png";

type Props = {
  onClose: () => void;
};

export function BridgeConfirmationModal({ onClose }: Props) {
  return (
    <Modal isOpen onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="600px">
        <ModalBody px={16} pt={16}>
          <Heading fontSize="2xl" mb={8}>
            Confirm Bridge Transaction
          </Heading>

          <VStack alignItems="stretch">
            <Item label="From" content="Primary Account" />

            <Divider />

            <Item
              label="Bridge Provider"
              content="Chainport"
              icon={chainportIcon}
              href="https://www.chainport.io/"
            />

            <Divider />

            <Grid templateColumns="auto 1fr auto">
              <GridItem>
                <Item
                  label="Source Network"
                  content="Iron Fish"
                  icon={chainportIcon}
                />
              </GridItem>
              <GridItem>
                <Item
                  label="Target Network"
                  content="Avalanche"
                  icon={chainportIcon}
                />
              </GridItem>
              <GridItem
                rowSpan={2}
                rowStart={1}
                colStart={2}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Flex
                  bg="#F3DEF5"
                  color={COLORS.ORCHID}
                  border="3px solid white"
                  borderRadius={4}
                  alignItems="center"
                  justifyContent="center"
                  h="39px"
                  w="42px"
                >
                  <BridgeArrows />
                </Flex>
              </GridItem>
              <GridItem>
                <Item
                  label="Source Network"
                  content="Iron Fish"
                  icon={chainportIcon}
                />
              </GridItem>
              <GridItem>
                <Item
                  label="Target Network"
                  content="Avalanche"
                  icon={chainportIcon}
                />
              </GridItem>
            </Grid>

            <Divider />

            <Item
              label="Target Address"
              content="0x0000000000000000000000000000000000000000"
              href="https://www.chainport.io/"
            />

            <Divider />

            <Item label="Iron Fish transaction fee" content="0.0000002 $IRON" />
            <Item label="Gas fee" content="0.04 $IRON" />
            <Item label="Port fee" content="0.0093 $IRON" />

            <Divider />
          </VStack>
        </ModalBody>

        <ModalFooter display="flex" gap={2} px={16} py={8}>
          <PillButton
            size="sm"
            variant="inverted"
            type="button"
            onClick={onClose}
          >
            Cancel
          </PillButton>
          <PillButton
            size="sm"
            type="button"
            onClick={() => {
              console.log("submit tx");
            }}
          >
            Confirm & Bridge
          </PillButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

type ItemProps = {
  label: string;
  content: string;
  icon?: StaticImageData;
  href?: string;
};

function Item({ label, content, icon, href }: ItemProps) {
  const maybeLinkProps = href
    ? ({
        as: "a",
        cursor: "pointer",
        rel: "noreferrer",
        href,
      } as const)
    : undefined;
  return (
    <Box py={2}>
      <Text color={COLORS.GRAY_MEDIUM}>{label}</Text>
      <HStack gap={1.5} mt={1} {...maybeLinkProps}>
        {icon && <Image src={chainportIcon} alt="" />}
        <Text
          data-type="content"
          as="span"
          fontSize="md"
          textDecoration={href ? "underline" : "none"}
        >
          {content}
        </Text>
        {href && (
          <Box mt="1px" color={COLORS.GRAY_MEDIUM}>
            <RxExternalLink />
          </Box>
        )}
      </HStack>
    </Box>
  );
}

function Divider() {
  return <Box borderBottom="1.5px dashed #DEDFE2" my={2} />;
}
