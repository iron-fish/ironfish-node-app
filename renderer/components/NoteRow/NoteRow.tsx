import { ChevronRightIcon } from "@chakra-ui/icons";
import { Box, HStack, Text, Flex } from "@chakra-ui/react";
import type {
  RpcAsset,
  TransactionStatus,
  TransactionType,
} from "@ironfish/sdk";
import { ReactNode, useMemo, useState } from "react";
import { MessageDescriptor, useIntl } from "react-intl";

import { trpcReact, TRPCRouterOutputs } from "@/providers/TRPCProvider";
import { MaybeLink } from "@/ui/ChakraLink/ChakraLink";
import { COLORS } from "@/ui/colors";
import { ShadowCard } from "@/ui/ShadowCard/ShadowCard";
import { CurrencyUtils } from "@/utils/currency";
import { formatDate } from "@/utils/formatDate";
import {
  refetchTransactionUntilTerminal,
  isTransactionStatusTerminal,
} from "@/utils/transactionUtils";

import { BridgeIcon } from "./icons/BridgeIcon";
import { ChangeIcon } from "./icons/ChangeIcon";
import { ExpiredIcon } from "./icons/ExpiredIcon";
import { PendingIcon } from "./icons/PendingIcon";
import { ReceivedIcon } from "./icons/ReceivedIcon";
import { SentIcon } from "./icons/SentIcon";
import { messages, CARET_WIDTH, useHeadingsText } from "./shared";
import { CopyAddress } from "../CopyAddress/CopyAddress";

function getNoteStatusDisplay(
  type: TransactionType,
  status: TransactionStatus,
  asTransaction: boolean,
  isSelfSend: boolean,
  isBridge: boolean,
): { icon: ReactNode; message: MessageDescriptor } {
  if (!asTransaction || status === "confirmed") {
    if (isSelfSend) {
      return { icon: <ChangeIcon />, message: messages.change };
    }

    if (isBridge && type === "send") {
      return { icon: <BridgeIcon />, message: messages.bridgeSent };
    }

    if (isBridge && type === "receive") {
      return { icon: <BridgeIcon />, message: messages.bridgeReceived };
    }

    if (type === "send") {
      return { icon: <SentIcon />, message: messages.sent };
    }

    if (type === "receive" || type === "miner") {
      return { icon: <ReceivedIcon />, message: messages.received };
    }

    const unhandledType: never = type;
    console.error("Unhandled transaction type", unhandledType);
    return { icon: <ReceivedIcon />, message: messages.received };
  }

  if (
    status === "pending" ||
    status === "unknown" ||
    status === "unconfirmed"
  ) {
    return { icon: <PendingIcon />, message: messages.pending };
  }

  if (status === "expired") {
    return { icon: <ExpiredIcon />, message: messages.expired };
  }

  const unhandledStatus: never = status;
  console.error("Unhandled transaction status", unhandledStatus);
  return { icon: <PendingIcon />, message: messages.pending };
}

function NoteTo({
  to,
  from,
  type,
  contact,
}: {
  to: string | string[];
  from: string;
  type: TransactionType;
  contact?: TRPCRouterOutputs["getContacts"][number] | undefined;
}) {
  const { formatMessage } = useIntl();

  if (Array.isArray(to)) {
    return <Text as="span">{formatMessage(messages.multipleRecipients)}</Text>;
  }

  return (
    <CopyAddress
      color={COLORS.BLACK}
      _dark={{ color: COLORS.WHITE }}
      address={type === "send" ? to : from}
      addressLabel={contact?.name}
    />
  );
}

export function NoteRow({
  accountName,
  asset,
  assetId,
  value,
  timestamp,
  from,
  to,
  type,
  status: initialStatus,
  memo,
  transactionHash,
  asTransaction = false,
  isBridge = false,
  contact,
}: {
  accountName: string;
  asset?: RpcAsset;
  assetId: string;
  value: string;
  timestamp: number;
  from: string;
  to: string | string[];
  type: TransactionType;
  status: TransactionStatus;
  memo: string | string[];
  transactionHash: string;
  contact?: TRPCRouterOutputs["getContacts"][number] | undefined;
  /**
   * Render the row as if it were a transaction (link it to the transaction details page,
   * show the status as the transaction's status)
   */
  asTransaction?: boolean;
  isBridge?: boolean;
}) {
  const { formatMessage } = useIntl();
  const [status, setStatus] = useState(initialStatus);

  // Poll Transaction if it is a non-terminal status
  trpcReact.getTransaction.useQuery(
    { accountName, transactionHash },
    {
      enabled: asTransaction && !isTransactionStatusTerminal(status),
      refetchInterval: refetchTransactionUntilTerminal,
      onSuccess: (data) => {
        if (data.transaction.status !== status) {
          setStatus(data.transaction.status);
        }
      },
    },
  );

  const statusDisplay = getNoteStatusDisplay(
    type,
    status,
    asTransaction,
    from === to && type !== "miner",
    isBridge,
  );
  const headings = useHeadingsText();

  const cellContent = useMemo(() => {
    let key = 0;

    const majorString = CurrencyUtils.render(
      value,
      assetId,
      asset?.verification,
    );
    const symbol = CurrencyUtils.shortSymbol(assetId, asset);

    return [
      <HStack gap={4} key={key++}>
        {statusDisplay.icon}
        <Text as="span">{formatMessage(statusDisplay.message)}</Text>
      </HStack>,
      <Text as="span" key={key++}>
        {`${majorString} ${symbol}`}
      </Text>,
      <Text as="span" key={key++}>
        <NoteTo to={to} from={from} type={type} contact={contact} />
      </Text>,
      <Text as="span" key={key++}>
        {formatDate(timestamp)}
      </Text>,
      <Text as="span" key={key++}>
        {!memo || isBridge
          ? "—"
          : Array.isArray(memo)
          ? formatMessage(messages.multipleMemos)
          : memo}
      </Text>,
    ];
  }, [
    asset,
    assetId,
    formatMessage,
    from,
    isBridge,
    memo,
    statusDisplay.icon,
    statusDisplay.message,
    timestamp,
    to,
    type,
    value,
  ]);

  return (
    <MaybeLink
      href={
        asTransaction
          ? `/accounts/${accountName}/transaction/${transactionHash}`
          : undefined
      }
      w="100%"
    >
      <Box py={2}>
        <ShadowCard
          hoverable={asTransaction}
          height={{
            base: "auto",
            lg: "86px",
          }}
          contentContainerProps={{
            display: "flex",
            alignItems: "center",
            p: 0,
          }}
        >
          <Flex
            w="100%"
            px={8}
            py={{
              base: 8,
              lg: 0,
            }}
            gap={{
              base: 0,
              lg: 4,
            }}
            flexWrap={{
              base: "wrap",
              lg: "nowrap",
            }}
          >
            {cellContent.map((content, i) => {
              const isTopRow = i < 3;
              return (
                <Flex
                  key={i}
                  flexGrow={1}
                  alignItems="center"
                  flexBasis={
                    isTopRow
                      ? {
                          base: "calc(33% - 6px)",
                          lg: 0,
                        }
                      : 0
                  }
                  width={
                    isTopRow
                      ? "auto"
                      : {
                          base: "50%",
                          lg: "auto",
                        }
                  }
                  mt={
                    isTopRow
                      ? 0
                      : {
                          base: 8,
                          lg: 0,
                        }
                  }
                >
                  <Box>
                    <Text
                      color={COLORS.GRAY_MEDIUM}
                      mb={2}
                      display={{
                        base: "block",
                        lg: "none",
                      }}
                    >
                      {headings[i]}
                    </Text>
                    {content}
                  </Box>
                </Flex>
              );
            })}
            {asTransaction && (
              <Flex
                w={CARET_WIDTH}
                justifyContent="flex-end"
                alignItems="center"
                display={{
                  base: "none",
                  lg: "flex",
                }}
              >
                <ChevronRightIcon
                  boxSize={5}
                  color={COLORS.GRAY_MEDIUM}
                  _dark={{ color: COLORS.DARK_MODE.GRAY_LIGHT }}
                />
              </Flex>
            )}
          </Flex>
        </ShadowCard>
      </Box>
    </MaybeLink>
  );
}
