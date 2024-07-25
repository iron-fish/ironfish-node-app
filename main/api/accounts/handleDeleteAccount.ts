import * as z from "zod";

import { ledgerStore } from "../../stores/ledgerStore";
import { manager } from "../manager";

export const handleDeleteAccountInputs = z.object({
  account: z.string(),
});

export async function handleDeleteAccount({
  account,
}: z.infer<typeof handleDeleteAccountInputs>) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const deleteResponse = await rpcClient.wallet.removeAccount({
    account,
    confirm: true,
  });

  await ledgerStore.setIsLedgerAccount(account, false);

  return deleteResponse.content;
}
