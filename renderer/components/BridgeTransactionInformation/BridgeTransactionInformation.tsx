import { BoxProps, Skeleton } from "@chakra-ui/react";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import { trpcReact, TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { IRONFISH_NETWORK_ID } from "@/utils/chainport/constants";
import {
  getMessageForStatus,
  useChainportTransactionStatus,
} from "@/utils/chainport/useChainportTransactionStatus";

import { BridgeTransactionInformationShell } from "./BridgeTransactionInformationShell";

type Transaction = TRPCRouterOutputs["getTransaction"]["transaction"];

type Props = BoxProps & {
  transaction: Transaction;
};

export function BridgeTransactionInformation({ transaction, ...rest }: Props) {
  const { formatMessage } = useIntl();
  const isSend = transaction.type === "send";

  const encodedBridgeNoteMemo = useMemo(() => {
    const match = transaction.notes?.find((note) => {
      return note.memo && !note.memo.includes("fee_payment");
    });
    return match || null;
  }, [transaction.notes]);

  const { data: chainportMeta } = trpcReact.getChainportMeta.useQuery();
  const { data: bridgeNoteMemo } = trpcReact.decodeMemo.useQuery(
    {
      memo: encodedBridgeNoteMemo?.memoHex ?? "",
    },
    {
      enabled: !!encodedBridgeNoteMemo,
    },
  );

  const baseNetworkId = isSend ? IRONFISH_NETWORK_ID : bridgeNoteMemo?.[0];

  const { data: chainportStatus, isLoading: isChainportStatusLoading } =
    trpcReact.getChainportTransactionStatus.useQuery(
      {
        transactionHash: transaction.hash,
        baseNetworkId: baseNetworkId ?? 0,
      },
      {
        enabled: !!baseNetworkId,
      },
    );

  const targetNetwork = useMemo(() => {
    if (!chainportStatus || !chainportMeta) return null;

    return chainportMeta.cp_network_ids[
      chainportStatus.target_network_id ?? ""
    ];
  }, [chainportMeta, chainportStatus]);

  const destinationTxHashContent = useMemo(() => {
    if (!chainportStatus || !chainportMeta) return null;

    const baseUrl =
      chainportMeta.cp_network_ids[chainportStatus.target_network_id ?? ""]
        ?.explorer_url;

    return {
      href: baseUrl
        ? baseUrl + "tx/" + chainportStatus.target_tx_hash
        : undefined,
      txHash: chainportStatus.target_tx_hash,
    };
  }, [chainportMeta, chainportStatus]);

  const status = useChainportTransactionStatus(transaction);

  const sourceNetwork = useMemo(() => {
    const result = chainportMeta?.cp_network_ids[baseNetworkId ?? ""];

    if (!result) return;

    return {
      name: result.label,
      icon: result.network_icon,
    };
  }, [baseNetworkId, chainportMeta?.cp_network_ids]);

  if (isChainportStatusLoading) {
    return (
      <BridgeTransactionInformationShell
        status={<Skeleton>placeholder</Skeleton>}
        type={<Skeleton>pending</Skeleton>}
        address={<Skeleton>0x12345678</Skeleton>}
        {...rest}
      />
    );
  }

  return (
    <BridgeTransactionInformationShell
      status={formatMessage(getMessageForStatus(isSend ? status : "complete"))}
      type={transaction.type}
      address={bridgeNoteMemo?.[1] ?? ""}
      networkIcon={targetNetwork?.network_icon ?? ""}
      targetTxHash={destinationTxHashContent?.txHash}
      blockExplorerUrl={destinationTxHashContent?.href}
      sourceNetwork={sourceNetwork}
      {...rest}
    />
  );
}
