import { HStack, VStack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { defineMessages, useIntl } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";
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

function NetworkSelectorContent({
  onSuccess,
  currentNetwork,
}: {
  onSuccess?: () => void;
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
    <VStack alignItems="stretch" gap={4}>
      <Select
        onChange={async (e) => {
          setSelectedNetwork(e.target.value);
        }}
        name={"Network Selector"}
        label="Network"
        options={networkOptions}
        value={selectedNetwork}
      />
      <HStack justifyContent="flex-start">
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
                  onSuccess?.();
                },
              },
            );
          }}
        >
          {isLoadingChangeNetwork
            ? formatMessage(messages.changingNetwork)
            : formatMessage(messages.changeNetwork)}
        </PillButton>
      </HStack>
    </VStack>
  );
}

type Props = {
  onSuccess?: () => void;
};

export function NetworkSelector({ onSuccess }: Props) {
  const { data } = trpcReact.getNetworkInfo.useQuery();

  if (!data) {
    return null;
  }

  return (
    <NetworkSelectorContent
      onSuccess={onSuccess}
      currentNetwork={data.networkId}
    />
  );
}
