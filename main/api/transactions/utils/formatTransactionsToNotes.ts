import { RpcAsset, RpcClient, RpcWalletTransaction } from "@ironfish/sdk";

import { IRON_ID } from "../../../../shared/constants";
import { TransactionNote } from "../../../../shared/types";

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
      ?.filter((_note) => {
        // @todo: Add ability to filter out self-send notes (to hide noisy change notes).
        // Consider that mining rewards are self-sends.
        return true;
      })
      .sort((note) => (note.assetId === IRON_ID ? -1 : 1))
      .map((note) => {
        return {
          assetName: assetLookup[note.assetId]?.name ?? "Unknown",
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

  const transactionNotes: Array<TransactionNote> = [];

  for (const tx of transactions) {
    const notes = await getTransactionNotes(
      client,
      tx,
      accountName,
      assetLookup,
    );
    transactionNotes.push(...notes);
  }

  return transactionNotes;
}
