import fs from "fs";

import {
  Assert,
  CurrencyUtils,
  PartialRecursive,
  TransactionType,
} from "@ironfish/sdk";
import { dialog } from "electron";
import { z } from "zod";

import {
  allAccountsByAddress,
  getTransactionsWithAssets,
} from "./utils/advancedQueries";
import { table, TableColumns } from "./utils/table";
import { TableCols, TableOutput } from "./utils/table-2";
import {
  getTransactionRows,
  getTransactionRowsByNote,
  TransactionAssetRow,
  TransactionNoteRow,
} from "./utils/transactionExportUtils";
import { manager } from "../manager";

export const handleExportTransactionsInput = z.object({
  accounts: z.array(z.string()),
  sequence: z.number().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  confirmations: z.number().optional(),
  format: z.union([
    z.literal("notes"),
    z.literal("transfers"),
    z.literal("transactions"),
  ]),
});

export async function handleExportTransactions({
  accounts,
  sequence,
  limit,
  offset,
  confirmations,
  format,
}: {
  accounts: string[];
  sequence?: number;
  limit?: number;
  offset?: number;
  confirmations?: number;
  format: "notes" | "transfers" | "transactions";
}) {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  const filePath = result.filePaths[0] + "/transactions.csv";
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const accountsByAddress = await allAccountsByAddress(rpcClient);

  const transactions = getTransactionsWithAssets(
    rpcClient,
    accounts,
    undefined,
    sequence,
    limit,
    offset,
    confirmations,
    format === "notes" || format === "transfers",
  );

  const transactionRows: PartialRecursive<TransactionRow>[] = [];

  for await (const { transaction, assetLookup } of transactions) {
    if (limit && transactionRows.length >= limit) {
      break;
    }

    let transactionSubRows: TransactionNoteRow[] | TransactionAssetRow[];
    if (format === "notes" || format === "transfers") {
      transactionSubRows = getTransactionRowsByNote(
        assetLookup,
        accountsByAddress,
        transaction,
        format,
      );
    } else {
      transactionSubRows = getTransactionRows(assetLookup, transaction);
    }

    const feePaid =
      transaction.type === TransactionType.SEND ? BigInt(transaction.fee) : 0n;
    const transactionType: string = transaction.type;
    // TODO: add chainport data
    // if (extractChainportDataFromTransaction(networkId, transaction)) {
    //   transactionType =
    //     transaction.type === TransactionType.SEND ? 'Bridge (outgoing)' : 'Bridge (incoming)'
    // }

    for (const [index, subRow] of transactionSubRows.entries()) {
      transactionRows.push({
        ...(index === 0
          ? { ...transaction, feePaid, type: transactionType }
          : {}),
        ...subRow,
      });
    }
  }

  const columns = getColumns(false, format, TableOutput.csv);

  const writeStream = fs.createWriteStream(filePath, { flags: "wx" });

  table(transactionRows, columns, {
    printLine: (line) => writeStream.write(line + "\n"),
  });

  writeStream.end();
}

function getColumns(
  extended: boolean,
  output: "notes" | "transactions" | "transfers",
  format: TableOutput,
): TableColumns<PartialRecursive<TransactionRow>> {
  let columns: TableColumns<PartialRecursive<TransactionRow>> = {
    timestamp: TableCols.timestamp({
      streaming: true,
    }),
    status: {
      header: "Status",
      minWidth: 12,
      get: (row) => row.status ?? "",
    },
    type: {
      header: "Type",
      minWidth: output === "notes" || output === "transfers" ? 18 : 8,
      get: (row) => row.type ?? "",
    },
    hash: {
      header: "Hash",
      minWidth: 32,
      get: (row) => row.hash ?? "",
    },
    notesCount: {
      header: "Notes",
      minWidth: 5,
      extended: true,
      get: (row) => row.notesCount ?? "",
    },
    spendsCount: {
      header: "Spends",
      minWidth: 5,
      extended: true,
      get: (row) => row.spendsCount ?? "",
    },
    mintsCount: {
      header: "Mints",
      minWidth: 5,
      extended: true,
      get: (row) => row.mintsCount ?? "",
    },
    burnsCount: {
      header: "Burns",
      minWidth: 5,
      extended: true,
      get: (row) => row.burnsCount ?? "",
    },
    expiration: {
      header: "Expiration",
      get: (row) => row.expiration ?? "",
    },
    submittedSequence: {
      header: "Submitted Sequence",
      get: (row) => row.submittedSequence ?? "",
    },
    feePaid: {
      header: "Fee Paid ($IRON)",
      get: (row) =>
        row.feePaid && row.feePaid !== 0n
          ? CurrencyUtils.render(row.feePaid)
          : "",
    },
    ...TableCols.asset({ extended, format }),
    amount: {
      header: "Amount",
      get: (row) => {
        Assert.isNotUndefined(row.amount);
        return CurrencyUtils.render(row.amount, false, row.assetId, {
          decimals: row.assetDecimals,
          symbol: row.assetSymbol,
        });
      },
      minWidth: 16,
    },
  };

  if (output === "notes" || output === "transfers") {
    columns = {
      ...columns,
      senderName: {
        header: "Sender",
        get: (row) => row.senderName ?? "",
      },
      sender: {
        header: "Sender Address",
        get: (row) => row.sender ?? "",
      },
      recipientName: {
        header: "Recipient",
        get: (row) => row.recipientName ?? "",
      },
      recipient: {
        header: "Recipient Address",
        get: (row) => row.recipient ?? "",
      },
      memo: {
        header: "Memo",
        get: (row) => row.memo ?? "",
      },
    };
  }

  if (format === TableOutput.cli) {
    columns = {
      group: {
        header: "",
        minWidth: 3,
        get: (row) => row.group ?? "",
      },
      ...columns,
    };
  }

  return columns;
}

type TransactionRow = {
  group?: string;
  timestamp: number;
  status: string;
  type: string;
  hash: string;
  assetId: string;
  assetName: string;
  assetDecimals?: number;
  assetSymbol?: string;
  amount: bigint;
  feePaid?: bigint;
  notesCount: number;
  spendsCount: number;
  mintsCount: number;
  burnsCount: number;
  expiration: number;
  submittedSequence: number;
  sender: string;
  senderName?: string;
  recipient: string;
  recipientName?: string;
  memo?: string;
};
