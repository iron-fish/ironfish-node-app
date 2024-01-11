import { ChevronRightIcon } from "@chakra-ui/icons";
import { Box, HStack, Text, Flex } from "@chakra-ui/react";
import type { TransactionStatus, TransactionType } from "@ironfish/sdk";
import { ReactNode, useMemo } from "react";
import { defineMessages, MessageDescriptor, useIntl } from "react-intl";

import { MaybeLink } from "@/ui/ChakraLink/ChakraLink";
import { COLORS } from "@/ui/colors";
import { ShadowCard } from "@/ui/ShadowCard/ShadowCard";
import { formatDate } from "@/utils/formatDate";
import { hexToUTF16String } from "@/utils/hexToUTF16String";
import { formatOre } from "@/utils/ironUtils";

import { ExpiredIcon } from "./icons/ExpiredIcon";
import { PendingIcon } from "./icons/PendingIcon";
import { ReceivedIcon } from "./icons/ReceivedIcon";
import { SentIcon } from "./icons/SentIcon";
import { useHeadingsText, headingMessages } from "./NoteHeadings";
import { CopyAddress } from "../CopyAddress/CopyAddress";

const CARET_WIDTH = "55px";

const messages = defineMessages({
  multipleRecipients: {
    defaultMessage: "Multiple recipients",
  },
  multipleMemos: {
    defaultMessage: "Multiple memos",
  },
});

function getNoteStatusDisplay(
  type: TransactionType,
  status: TransactionStatus,
  asTransaction: boolean,
): { icon: ReactNode; message: MessageDescriptor } {
  if (asTransaction || status === "confirmed") {
    if (type === "send") {
      return { icon: <SentIcon />, message: headingMessages.sent };
    } else if (type === "receive" || type === "miner") {
      return { icon: <ReceivedIcon />, message: headingMessages.received };
    }

    const unhandledType: never = type;
    console.error("Unhandled transaction type", unhandledType);
    return { icon: <ReceivedIcon />, message: headingMessages.received };
  } else if (
    status === "pending" ||
    status === "unknown" ||
    status === "unconfirmed"
  ) {
    return { icon: <PendingIcon />, message: headingMessages.pending };
  } else if (status === "expired") {
    return { icon: <ExpiredIcon />, message: headingMessages.expired };
  }

  const unhandledStatus: never = status;
  console.error("Unhandled transaction status", unhandledStatus);
  return { icon: <PendingIcon />, message: headingMessages.pending };
}

function NoteTo({
  to,
  from,
  type,
}: {
  to: string | string[];
  from: string;
  type: TransactionType;
}) {
  const { formatMessage } = useIntl();

  if (Array.isArray(to)) {
    return (
      <Text as="span">{formatMessage(headingMessages.multipleRecipients)}</Text>
    );
  }

  return (
    <CopyAddress
      color={COLORS.BLACK}
      _dark={{ color: COLORS.WHITE }}
      address={type === "send" ? to : from}
    />
  );
}

export function NoteRow({
  accountName,
  assetName,
  value,
  timestamp,
  from,
  to,
  type,
  status,
  memo,
  transactionHash,
  asTransaction = false,
}: {
  accountName: string;
  assetName: string;
  value: string;
  timestamp: number;
  from: string;
  to: string | string[];
  type: TransactionType;
  status: TransactionStatus;
  memo: string | string[];
  transactionHash: string;
  /**
   * Render the row as if it were a transaction (link it to the transaction details page,
   * show the status as the transaction's status)
   */
  asTransaction?: boolean;
}) {
  const { formatMessage } = useIntl();
  const statusDisplay = getNoteStatusDisplay(type, status, asTransaction);
  const headings = useHeadingsText();

  const cellContent = useMemo(() => {
    let key = 0;
    return [
      <HStack gap={4} key={key++}>
        {statusDisplay.icon}
        <Text as="span">{formatMessage(statusDisplay.message)}</Text>
      </HStack>,
      <Text as="span" key={key++}>
        {formatOre(value)} {hexToUTF16String(assetName)}
      </Text>,
      <Text as="span" key={key++}>
        <NoteTo to={to} from={from} type={type} />
      </Text>,
      <Text as="span" key={key++}>
        {formatDate(timestamp)}
      </Text>,
      <Text as="span" key={key++}>
        {!memo
          ? "—"
          : Array.isArray(memo)
          ? formatMessage(messages.multipleMemos)
          : memo}
      </Text>,
    ];
  }, [
    assetName,
    formatMessage,
    from,
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
