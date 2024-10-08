import { getTransactionNotes } from "./utils/formatTransactionsToNotes";
import { extractChainportDataFromTransaction } from "../chainport/vendor/utils";
import { manager } from "../manager";

export async function handleGetTransaction({
  accountName,
  transactionHash,
}: {
  accountName: string;
  transactionHash: string;
}) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const { content } = await rpcClient.wallet.getAccountTransaction({
    account: accountName,
    hash: transactionHash,
    notes: true,
  });

  if (content.transaction == null) {
    throw new Error(
      `No transaction found for ${content.account} with hash ${transactionHash}`,
    );
  }

  const network = (await rpcClient.chain.getNetworkInfo()).content.networkId;
  const chainportData = extractChainportDataFromTransaction(
    network,
    content.transaction,
  );

  const notes = await getTransactionNotes(
    rpcClient,
    content.transaction,
    accountName,
  );

  return {
    transaction: content.transaction,
    notes,
    chainportData,
  };
}
