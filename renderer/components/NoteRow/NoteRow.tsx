import { ChevronRightIcon } from "@chakra-ui/icons";
import { Box, Grid, GridItem, HStack, Text } from "@chakra-ui/react";
import type { TransactionStatus, TransactionType } from "@ironfish/sdk";
import { ReactNode } from "react";

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

export function NotesHeadings() {
  return (
    <Grid
      templateColumns={{
        base: `repeat(5, 1fr)`,
        md: `repeat(5, 1fr) 55px`,
      }}
      opacity="0.8"
      mb={4}
    >
      <GridItem pl={8}>
        <Text as="span">Action</Text>
      </GridItem>
      <GridItem>
        <Text as="span">Amount</Text>
      </GridItem>
      <GridItem>
        <Text as="span">From/To</Text>
      </GridItem>
      <GridItem>
        <Text as="span">Date</Text>
      </GridItem>
      <GridItem>
        <Text as="span">Memo</Text>
      </GridItem>
    </Grid>
  );
}

function getNoteStatusDisplay(
  type: TransactionType,
  status: TransactionStatus,
  asTransaction: boolean,
): { icon: ReactNode; text: string } {
  if (asTransaction || status === "confirmed") {
    if (type === "send") {
      return { icon: <SentIcon />, text: "Sent" };
    } else if (type === "receive" || type === "miner") {
      return { icon: <ReceivedIcon />, text: "Received" };
    }

    const unhandledType: never = type;
    console.error("Unhandled transaction type", unhandledType);
    return { icon: <ReceivedIcon />, text: "Received" };
  } else if (
    status === "pending" ||
    status === "unknown" ||
    status === "unconfirmed"
  ) {
    return { icon: <PendingIcon />, text: "Pending" };
  } else if (status === "expired") {
    return { icon: <ExpiredIcon />, text: "Expired" };
  }

  const unhandledStatus: never = status;
  console.error("Unhandled transaction status", unhandledStatus);
  return { icon: <PendingIcon />, text: "Pending" };
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
  to: string;
  type: TransactionType;
  status: TransactionStatus;
  memo: string;
  transactionHash: string;
  /**
   * Render the row as if it were a transaction (link it to the transaction details page,
   * show the status as the transaction's status)
   */
  asTransaction?: boolean;
}) {
  const statusDisplay = getNoteStatusDisplay(type, status, asTransaction);

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
          height="86px"
          contentContainerProps={{
            display: "flex",
            alignItems: "center",
            p: 0,
          }}
        >
          <Grid
            templateColumns={{
              base: `repeat(5, 1fr)`,
              md: asTransaction ? `repeat(5, 1fr) 55px` : `repeat(5, 1fr)`,
            }}
            opacity="0.8"
            w="100%"
            gap={4}
          >
            <GridItem display="flex" alignItems="center" pl={8}>
              <HStack gap={4}>
                {statusDisplay.icon}
                <Text as="span">{statusDisplay.text}</Text>
              </HStack>
            </GridItem>
            <GridItem display="flex" alignItems="center">
              <Text as="span">
                {formatOre(value)} {hexToUTF16String(assetName)}
              </Text>
            </GridItem>
            <GridItem display="flex" alignItems="center">
              <Text as="span">
                <CopyAddress
                  color={COLORS.BLACK}
                  _dark={{ color: COLORS.WHITE }}
                  address={type === "send" ? to : from}
                />
              </Text>
            </GridItem>
            <GridItem display="flex" alignItems="center">
              <Text as="span">{formatDate(timestamp)}</Text>
            </GridItem>
            <GridItem display="flex" alignItems="center">
              <Text as="span">{memo || "—"}</Text>
            </GridItem>
            {asTransaction && (
              <GridItem
                alignItems="center"
                display={{
                  base: "none",
                  md: "flex",
                }}
              >
                <ChevronRightIcon
                  boxSize={5}
                  color={COLORS.GRAY_MEDIUM}
                  _dark={{ color: COLORS.DARK_MODE.GRAY_LIGHT }}
                />
              </GridItem>
            )}
          </Grid>
        </ShadowCard>
      </Box>
    </MaybeLink>
  );
}
