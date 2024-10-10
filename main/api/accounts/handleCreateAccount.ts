import { AccountFormat } from "@ironfish/sdk";

import { contactsStore } from "../../stores/contactsStore";
import { manager } from "../manager";

export async function handleCreateAccount({ name }: { name: string }) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const createResponse = await rpcClient.wallet.createAccount({
    name,
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

  try {
    contactsStore.addContact({
      name,
      address: createResponse.content.publicAddress,
    });
  } catch (error) {
    console.error("Failed to add contact", error);
  }

  return {
    name: createResponse.content.name,
    publicAddress: createResponse.content.publicAddress,
    mnemonic,
  };
}
