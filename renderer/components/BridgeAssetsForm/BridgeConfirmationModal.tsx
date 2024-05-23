import {
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  VStack,
  Grid,
  GridItem,
  Flex,
  ModalFooter,
} from "@chakra-ui/react";

import { COLORS } from "@/ui/colors";
import { PillButton } from "@/ui/PillButton/PillButton";
import { BridgeArrows } from "@/ui/SVGs/BridgeArrows";

import chainportIcon from "./assets/chainport-icon.png";
import ironfishIcon from "./assets/ironfish-icon.png";
import { BridgeAssetsFormData } from "./bridgeAssetsSchema";
import { LineItem, Divider } from "../LineItem/LineItem";

type Props = {
  formData: BridgeAssetsFormData;
  onClose: () => void;
};

export function BridgeConfirmationModal({ formData, onClose }: Props) {
  console.log(formData);
  return (
    <Modal isOpen onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="600px">
        <ModalBody px={16} pt={16}>
          <Heading fontSize="2xl" mb={8}>
            Confirm Bridge Transaction
          </Heading>

          <VStack alignItems="stretch">
            <LineItem label="From" content={formData.fromAccount} />

            <Divider />

            <LineItem
              label="Bridge Provider"
              content="Chainport"
              icon={chainportIcon}
              href="https://www.chainport.io/"
            />

            <Divider />

            <Grid templateColumns="auto 1fr auto">
              <GridItem>
                <LineItem
                  label="Source Network"
                  content="Iron Fish"
                  icon={ironfishIcon}
                />
              </GridItem>
              <GridItem>
                <LineItem
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
                <LineItem
                  label="Sending"
                  content="123 $IRON"
                  icon={ironfishIcon}
                />
              </GridItem>
              <GridItem>
                <LineItem
                  label="Receiving"
                  content="122.5 wIRON"
                  icon={chainportIcon}
                />
              </GridItem>
            </Grid>

            <Divider />

            <LineItem
              label="Target Address"
              content="0x0000000000000000000000000000000000000000"
              href="https://www.chainport.io/"
            />

            <Divider />

            <LineItem
              label="Iron Fish transaction fee"
              content="0.0000002 $IRON"
            />
            <LineItem label="Gas fee" content="0.04 $IRON" />
            <LineItem label="Port fee" content="0.0093 $IRON" />

            <Divider />
          </VStack>
        </ModalBody>

        <ModalFooter display="flex" gap={2} px={16} py={8}>
          <PillButton
            size="sm"
            variant="inverted"
            type="button"
            onClick={onClose}
            border={0}
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
