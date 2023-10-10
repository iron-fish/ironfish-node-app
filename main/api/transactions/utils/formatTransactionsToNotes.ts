import { Asset } from "@ironfish/rust-nodejs";
import {
  RpcAsset,
  RpcClient,
  RpcWalletTransaction,
  TransactionType,
} from "@ironfish/sdk";

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
  const nativeAssetId = Asset.nativeId().toString("hex");

  const transactionNotes: Array<TransactionNote> = [];

  for (const tx of transactions) {
    tx.notes
      ?.filter((note) => {
        // Filter out notes that only represent the fee...

        // If it's a receive transaction, it's not the fee.
        if (tx.type === "receive") return true;

        // If a note is not the native asset, it's not the fee.
        if (note.assetId !== nativeAssetId) return true;

        // If the owner is not the sender, it's not the fee.
        if (note.owner !== note.sender) return true;

        // If the note has a memo, it's not the fee.
        if (note.memo) return true;

        // @todo: This doesn't take into account if the user sent themselves $IRON.
        return false;
      })
      .sort((note) => (note.assetId === nativeAssetId ? -1 : 1))
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
