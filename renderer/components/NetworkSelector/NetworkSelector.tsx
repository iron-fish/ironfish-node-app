import {
  Box,
  Flex,
  FlexProps,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import { MdOutlineLan } from "react-icons/md";
import { defineMessages, useIntl } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";
import { COLORS } from "@/ui/colors";
import { Select } from "@/ui/Forms/Select/Select";
import { PillButton } from "@/ui/PillButton/PillButton";

const messages = defineMessages({
  mainnet: {
    defaultMessage: "Mainnet",
  },
  testnet: {
    defaultMessage: "Testnet",
  },
  chooseNetwork: {
    defaultMessage: "Choose the network",
  },
  selectNetwork: {
    defaultMessage: "Select network",
  },
  description: {
    defaultMessage: "The Iron Fish Node App supports {networkCount} networks.",
  },
  changeNetwork: {
    defaultMessage: "Change Network",
  },
  changingNetwork: {
    defaultMessage: "Changing Network",
  },
});

const networkOptionsById = {
  1: {
    label: "Mainnet",
    value: "MAINNET",
  },
  0: {
    label: "Testnet",
    value: "TESTNET",
  },
};

const networkOptions = Object.values(networkOptionsById);

const getNetworkById = (id: number) => {
  if (!(id in networkOptionsById)) {
    throw new Error(`Invalid network ID ${id} not found.`);
  }
  return networkOptionsById[id as keyof typeof networkOptionsById];
};

type Props = {
  buttonContainerProps?: FlexProps;
};

export function NetworkSelector({ buttonContainerProps }: Props) {
  const { formatMessage } = useIntl();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data } = trpcReact.getNetworkInfo.useQuery();

  if (!data) {
    return null;
  }

  return (
    <>
      <Flex
        aria-label={formatMessage(messages.selectNetwork)}
        as="button"
        borderRadius="5px"
        bg={COLORS.GRAY_LIGHT}
        color={COLORS.GRAY_MEDIUM}
        justifyContent={{
          base: "center",
          md: "space-between",
        }}
        alignItems="center"
        py="6px"
        px={{
          base: 0,
          md: "18px",
        }}
        _dark={{
          bg: COLORS.DARK_MODE.GRAY_MEDIUM,
          color: COLORS.DARK_MODE.GRAY_LIGHT,
        }}
        width={{
          base: "34px",
          md: "100%",
        }}
        height={{
          base: "34px",
          md: "100%",
        }}
        onClick={onOpen}
        {...buttonContainerProps}
      >
        <Flex alignItems="center" justifyContent="center">
          <MdOutlineLan />
          <Text
            ml={18}
            mr={3}
            as="span"
            display={{
              base: "none",
              md: "block",
            }}
          >
            {getNetworkById(data.networkId).label}
          </Text>
        </Flex>
        <Box
          display={{
            base: "none",
            md: "block",
          }}
        >
          <FaChevronRight fontSize="0.6em" />
        </Box>
      </Flex>

      {data && (
        <NetworkSelectorModal
          isOpen={isOpen}
          onClose={onClose}
          currentNetwork={data.networkId}
        />
      )}
    </>
  );
}

function NetworkSelectorModal({
  isOpen,
  onClose,
  currentNetwork,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentNetwork: number;
}) {
  const router = useRouter();
  const { mutate: changeNetwork, isLoading: isLoadingChangeNetwork } =
    trpcReact.changeNetwork.useMutation();
  const { formatMessage } = useIntl();

  const [selectedNetwork, setSelectedNetwork] = useState(
    getNetworkById(currentNetwork).value,
  );

  const hasChanged = getNetworkById(currentNetwork).value !== selectedNetwork;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW="100%" width="600px">
        <ModalBody px={16} pt={16}>
          <Heading fontSize="2xl" mb={4}>
            {formatMessage(messages.chooseNetwork)}
          </Heading>
          <Text mb={8}>
            {formatMessage(messages.description, {
              networkCount: networkOptions.length,
            })}
          </Text>

          <Select
            onChange={async (e) => {
              setSelectedNetwork(e.target.value);
            }}
            name={"Network Selector"}
            label="Network"
            options={networkOptions}
            value={selectedNetwork}
          />
        </ModalBody>

        <ModalFooter display="flex" gap={2} py={8}>
          <PillButton
            isDisabled={!hasChanged || isLoadingChangeNetwork}
            height="60px"
            px={8}
            border={0}
            onClick={() => {
              changeNetwork(
                {
                  network: String(selectedNetwork) as "MAINNET" | "TESTNET",
                },
                {
                  onSuccess: () => {
                    router.replace("/home");
                    onClose();
                  },
                },
              );
            }}
          >
            {isLoadingChangeNetwork
              ? formatMessage(messages.changingNetwork)
              : formatMessage(messages.changeNetwork)}
          </PillButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
