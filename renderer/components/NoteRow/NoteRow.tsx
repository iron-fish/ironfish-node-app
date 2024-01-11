import { ChevronRightIcon } from "@chakra-ui/icons";
import { Box, Grid, GridItem, HStack, Text, Flex } from "@chakra-ui/react";
import type { TransactionStatus, TransactionType } from "@ironfish/sdk";
import { ReactNode } from "react";
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
import { CopyAddress } from "../CopyAddress/CopyAddress";

const CARET_WIDTH = "55px";

const messages = defineMessages({
  action: {
    defaultMessage: "Action",
  },
  amount: {
    defaultMessage: "Amount",
  },
  fromTo: {
    defaultMessage: "From/To",
  },
  date: {
    defaultMessage: "Date",
  },
  memo: {
    defaultMessage: "Memo",
  },
  sent: {
    defaultMessage: "Sent",
  },
  received: {
    defaultMessage: "Received",
  },
  pending: {
    defaultMessage: "Pending",
  },
  expired: {
    defaultMessage: "Expired",
  },
  multipleRecipients: {
    defaultMessage: "Multiple recipients",
  },
  multipleMemos: {
    defaultMessage: "Multiple memos",
  },
});

export function useHeadingsText() {
  const { formatMessage } = useIntl();
  return [
    formatMessage(messages.action),
    formatMessage(messages.amount),
    formatMessage(messages.fromTo),
    formatMessage(messages.date),
    formatMessage(messages.memo),
  ];
}

export function NotesHeadings() {
  const headingsText = useHeadingsText();

  return (
    <Grid
      display={{
        base: "none",
        lg: "grid",
      }}
      templateColumns={{
        base: `repeat(5, 1fr)`,
        lg: `repeat(5, 1fr) ${CARET_WIDTH}`,
      }}
      opacity="0.8"
      mb={4}
      px={8}
    >
      {headingsText.map((heading, i) => (
        <GridItem key={i}>
          <Text as="span">{heading}</Text>
        </GridItem>
      ))}
    </Grid>
  );
}

function getNoteStatusDisplay(
  type: TransactionType,
  status: TransactionStatus,
  asTransaction: boolean,
): { icon: ReactNode; message: MessageDescriptor } {
  if (asTransaction || status === "confirmed") {
    if (type === "send") {
      return { icon: <SentIcon />, message: messages.sent };
    } else if (type === "receive" || type === "miner") {
      return { icon: <ReceivedIcon />, message: messages.received };
    }

    const unhandledType: never = type;
    console.error("Unhandled transaction type", unhandledType);
    return { icon: <ReceivedIcon />, message: messages.received };
  } else if (
    status === "pending" ||
    status === "unknown" ||
    status === "unconfirmed"
  ) {
    return { icon: <PendingIcon />, message: messages.pending };
  } else if (status === "expired") {
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
}: {
  to: string | string[];
  from: string;
  type: TransactionType;
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
            <Flex
              flexBasis={{
                base: "calc(33% - 6px)",
                lg: 0,
              }}
              flexGrow={1}
              alignItems="center"
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
                  {headings[0]}
                </Text>
                <HStack gap={4}>
                  {statusDisplay.icon}
                  <Text as="span">{formatMessage(statusDisplay.message)}</Text>
                </HStack>
              </Box>
            </Flex>
            <Flex
              flexBasis={{
                base: "calc(33% - 6px)",
                lg: 0,
              }}
              flexGrow={1}
              alignItems="center"
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
                  {headings[1]}
                </Text>
                <Text as="span">
                  {formatOre(value)} {hexToUTF16String(assetName)}
                </Text>
              </Box>
            </Flex>
            <Flex
              flexBasis={{
                base: "calc(33% - 6px)",
                lg: 0,
              }}
              flexGrow={1}
              alignItems="center"
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
                  {headings[2]}
                </Text>
                <Text as="span">
                  <NoteTo to={to} from={from} type={type} />
                </Text>
              </Box>
            </Flex>
            <Flex
              flexBasis={0}
              width={{
                base: "50%",
                lg: "auto",
              }}
              flexGrow={1}
              alignItems="center"
              mt={{
                base: 8,
                lg: 0,
              }}
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
                  {headings[3]}
                </Text>
                <Text as="span">{formatDate(timestamp)}</Text>
              </Box>
            </Flex>
            <Flex
              flexBasis={0}
              width={{
                base: "50%",
                lg: "auto",
              }}
              flexGrow={1}
              alignItems="center"
              mt={{
                base: 8,
                lg: 0,
              }}
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
                  {headings[4]}
                </Text>
                <Text as="span">
                  {!memo
                    ? "—"
                    : Array.isArray(memo)
                    ? formatMessage(messages.multipleMemos)
                    : memo}
                </Text>
              </Box>
            </Flex>
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
