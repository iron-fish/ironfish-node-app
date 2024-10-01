import { AccountFormat } from "@ironfish/sdk";

import { contactsStore } from "../../stores/contactsStore";
import { manager } from "../manager";

export async function handleAddContact({
  name,
  address,
}: {
  name: string;
  address: string;
}) {
  try {
    contactsStore.addContact({ name, address });
  } catch (error) {
    console.error("Failed to add contact", error);
  }
}

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

  await handleAddContact({
    name: createResponse.content.name,
    address: createResponse.content.publicAddress,
  });

  return {
    name: createResponse.content.name,
    publicAddress: createResponse.content.publicAddress,
    mnemonic,
  };
}
