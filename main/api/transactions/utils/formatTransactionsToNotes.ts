import { RpcAsset, RpcClient, RpcWalletTransaction } from "@ironfish/sdk";
import log from "electron-log";

import { IRON_ID } from "../../../../shared/constants";
import { TransactionNote } from "../../../../shared/types";
import { extractChainportDataFromTransaction } from "../../chainport/vendor/utils";

export async function createAssetLookup(
  client: RpcClient,
  assetIds: string[],
  accountName: string,
): Promise<{ [key: string]: RpcAsset }> {
  assetIds = [...new Set(assetIds)];
  const assets = await Promise.all(
    assetIds.map((id) => client.wallet.getAsset({ id, account: accountName })),
  );
  return Object.fromEntries(
    assets.map((asset) => [asset.content.id, asset.content]),
  );
}

export async function getTransactionNotes(
  client: RpcClient,
  transaction: RpcWalletTransaction,
  accountName: string,
  maybeAssetLookup?: { [key: string]: RpcAsset },
) {
  const assetLookup =
    maybeAssetLookup ??
    (await createAssetLookup(
      client,
      transaction.notes?.map((note) => note.assetId) ?? [],
      accountName,
    ));

  const transactionNotes: Array<TransactionNote> =
    transaction.notes
      ?.sort((note) => (note.assetId === IRON_ID ? -1 : 1))
      .map((note) => {
        return {
          asset: assetLookup[note.assetId],
          assetId: note.assetId,
          value: note.value,
          timestamp: transaction.timestamp,
          from: note.sender,
          to: note.owner,
          transactionHash: transaction.hash,
          type: transaction.type,
          status: transaction.status,
          memo: note.memo,
          noteHash: note.noteHash,
          accountName,
          chainportData: undefined,
        };
      }) ?? [];

  return transactionNotes;
}

export async function formatTransactionsToNotes(
  client: RpcClient,
  transactions: RpcWalletTransaction[],
  accountName: string,
): Promise<TransactionNote[]> {
  const transactionAssetIds = transactions.flatMap((tx) => {
    return tx.notes?.map((note) => note.assetId) ?? [];
  });
  const assetLookup = await createAssetLookup(
    client,
    transactionAssetIds,
    accountName,
  );

  const network = (await client.chain.getNetworkInfo()).content.networkId;

  const transactionNotes: Array<TransactionNote> = [];

  for (const tx of transactions) {
    // Ignore transactions without at least 1 note
    if (!tx.notes || tx.notes.length === 0) {
      log.warn(`Unexpected transaction with 0 or undefined notes: ${tx.hash}`);
      continue;
    }

    const chainportData = extractChainportDataFromTransaction(network, tx);

    const firstNote = tx.notes[0];

    // True if any asset balance is non-zero, ignoring the transaction fee (if current account is sender)
    const anyNonZero = tx.assetBalanceDeltas.some((abd) => {
      const deltaWithoutFee =
        abd.delta.startsWith("-") && abd.assetId === IRON_ID
          ? (BigInt(abd.delta) + BigInt(tx.fee)).toString()
          : abd.delta;

      return deltaWithoutFee !== "0";
    });

    // Make a TransactionNote for each asset balance delta
    for (const abd of tx.assetBalanceDeltas) {
      const asset = assetLookup[abd.assetId];

      const deltaWithoutFee =
        abd.delta.startsWith("-") && abd.assetId === IRON_ID
          ? (BigInt(abd.delta) + BigInt(tx.fee)).toString()
          : abd.delta;
      const absoluteDeltaWithoutFee = deltaWithoutFee.replace("-", "");

      // We want to show at least one TransactionNote for every transaction. For note-combining transactions,
      // all deltas will be 0, so we'll show 0-value deltas. But in cases where we have at least one non-zero
      // delta, we can hide the 0-value deltas (notably this happens for $IRON fees on custom asset transactions)
      if (anyNonZero && absoluteDeltaWithoutFee === "0") {
        continue;
      }

      // Ignoring self-sends (change notes), build a list of note recipients
      let to;
      const owners = [
        ...new Set(
          tx.notes
            .filter(
              (n) => n.assetId === abd.assetId && n.owner !== firstNote.sender,
            )
            .map((n) => n.owner),
        ).values(),
      ];
      if (owners.length === 0) {
        to = firstNote.sender;
      } else if (owners.length === 1) {
        to = owners[0];
      } else {
        to = owners;
      }

      // Ignoring empty memos, build a list of unique memos
      let memo;
      const memos = [
        ...new Set(
          tx.notes
            .filter((n) => n.assetId === abd.assetId && n.memo)
            .map((n) => n.memo),
        ).values(),
      ];
      if (memos.length === 0) {
        memo = "";
      } else if (memos.length === 1) {
        memo = memos[0];
      } else {
        memo = memos;
      }

      transactionNotes.push({
        accountName,
        asset: asset,
        assetId: abd.assetId,
        from: firstNote.sender,
        to: to,
        status: tx.status,
        timestamp: tx.timestamp,
        transactionHash: tx.hash,
        type: tx.type,
        value: absoluteDeltaWithoutFee,
        noteHash: "",
        memo: memo,
        chainportData,
      });
    }
  }

  return transactionNotes;
}
