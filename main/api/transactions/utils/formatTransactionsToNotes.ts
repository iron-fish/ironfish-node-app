import {
  RpcAsset,
  RpcClient,
  RpcWalletTransaction,
  TransactionType,
} from "@ironfish/sdk";

import { IRON_ID } from "../../../../shared/constants";

export async function createAssetLookup(
  client: RpcClient,
  assetIds: string[],
): Promise<{ [key: string]: RpcAsset }> {
  assetIds = [...new Set(assetIds)];
  const assets = await Promise.all(
    assetIds.map((id) => client.wallet.getAsset({ id })),
  );
  return Object.fromEntries(
    assets.map((asset) => [asset.content.id, asset.content]),
  );
}

export type TransactionNote = {
  assetName: string;
  value: string;
  timestamp: number;
  from: string;
  to: string;
  transactionHash: string;
  type: TransactionType;
  memo: string;
};

export async function formatTransactionsToNotes(
  client: RpcClient,
  transactions: RpcWalletTransaction[],
): Promise<TransactionNote[]> {
  const transactionAssetIds = transactions.flatMap((tx) => {
    return tx.notes?.map((note) => note.assetId) ?? [];
  });
  const assetLookup = await createAssetLookup(client, transactionAssetIds);

  const transactionNotes: Array<TransactionNote> = [];

  for (const tx of transactions) {
    tx.notes
      ?.filter((_note) => {
        // @todo: Add ability to filter out self-send notes (to hide noisy change notes).
        // Consider that mining rewards are self-sends.
        return true;
      })
      .sort((note) => (note.assetId === IRON_ID ? -1 : 1))
      .forEach((note) => {
        transactionNotes.push({
          assetName: assetLookup[note.assetId]?.name ?? "Unknown",
          value: note.value,
          timestamp: tx.timestamp,
          from: note.sender,
          to: note.owner,
          transactionHash: tx.hash,
          type: tx.type,
          memo: note.memo,
        });
      }) ?? [];
  }

  return transactionNotes;
}
