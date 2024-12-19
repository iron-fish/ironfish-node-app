import { AccountFormat, CreateAccountRequest } from "@ironfish/sdk";

import { manager } from "../manager";

export async function handleCreateAccount({
  name,
  createdAt,
  head,
}: CreateAccountRequest) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const createResponse = await rpcClient.wallet.createAccount({
    name,
    createdAt,
    head,
  });

  const exportResponse = await rpcClient.wallet.exportAccount({
    account: createResponse.content.name,
    viewOnly: false,
    format: AccountFormat.Mnemonic,
  });

  const mnemonic = exportResponse.content.account?.toString();

  if (!mnemonic) {
    throw new Error("Failed to get mnemonic phrase");
  }

  return {
    name: createResponse.content.name,
    publicAddress: createResponse.content.publicAddress,
    mnemonic,
  };
}
