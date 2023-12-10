import * as z from "zod";

import { manager } from "../manager";

export const handleDeleteAccountInputs = z.object({
  account: z.string(),
});

export async function handleDeleteAccount({
  account,
}: z.infer<typeof handleDeleteAccountInputs>) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  rpcClient.wallet.removeAccount({
    account,
  });

  const renameResponse = await rpcClient.wallet.removeAccount({
    account,
  });

  return renameResponse.content;
}
