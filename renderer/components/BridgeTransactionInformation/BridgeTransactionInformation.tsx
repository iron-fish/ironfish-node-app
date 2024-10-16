import { BoxProps, Skeleton } from "@chakra-ui/react";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import { trpcReact, TRPCRouterOutputs } from "@/providers/TRPCProvider";
import {
  getMessageForStatus,
  useChainportTransactionStatus,
} from "@/utils/chainport/useChainportTransactionStatus";

import { BridgeTransactionInformationShell } from "./BridgeTransactionInformationShell";

type Transaction = TRPCRouterOutputs["getTransaction"]["transaction"];
type ChainportData = NonNullable<
  TRPCRouterOutputs["getTransaction"]["chainportData"]
>;

type Props = BoxProps & {
  transaction: Transaction;
  chainportData: ChainportData;
};

export function BridgeTransactionInformation({
  transaction,
  chainportData,
  ...rest
}: Props) {
  const { formatMessage } = useIntl();
  const isSend = transaction.type === "send";

  const { data: chainportNetworks } = trpcReact.getChainportNetworks.useQuery();

  const { data: chainportStatus, isLoading: isChainportStatusLoading } =
    trpcReact.getChainportTransactionStatus.useQuery(
      {
        transactionHash: transaction.hash,
      },
      {
        enabled: isSend,
      },
    );

  const otherNetwork = useMemo(() => {
    if (!chainportNetworks) return null;

    return chainportNetworks.find(
      (network) =>
        network.chainport_network_id === chainportData.chainportNetworkId,
    );
  }, [chainportNetworks, chainportData.chainportNetworkId]);

  const destinationTxHashContent = useMemo(() => {
    if (
      !chainportStatus ||
      !("target_tx_hash" in chainportStatus) ||
      !otherNetwork ||
      !isSend
    )
      return null;

    return {
      href: otherNetwork.explorer_url
        ? otherNetwork.explorer_url + "tx/" + chainportStatus.target_tx_hash
        : undefined,
      txHash: chainportStatus.target_tx_hash,
    };
  }, [otherNetwork, chainportStatus, isSend]);

  const status = useChainportTransactionStatus(transaction);

  const sourceNetwork = useMemo(() => {
    if (!otherNetwork || isSend) return;

    return {
      name: otherNetwork.label,
      icon: otherNetwork.network_icon,
    };
  }, [otherNetwork, isSend]);

  if (isChainportStatusLoading) {
    return (
      <BridgeTransactionInformationShell
        status={<Skeleton>placeholder</Skeleton>}
        type={<Skeleton>pending</Skeleton>}
        address={chainportData.address}
        {...rest}
      />
    );
  }

  return (
    <BridgeTransactionInformationShell
      status={formatMessage(getMessageForStatus(isSend ? status : "complete"))}
      type={transaction.type}
      address={chainportData.address}
      networkIcon={otherNetwork?.network_icon ?? ""}
      destinationTxHash={destinationTxHashContent?.txHash ?? undefined}
      blockExplorerUrl={destinationTxHashContent?.href}
      sourceNetwork={sourceNetwork}
      {...rest}
    />
  );
}
