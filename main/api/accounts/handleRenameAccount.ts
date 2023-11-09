import * as z from "zod";

import { manager } from "../manager";

export const handleRenameAccountInputs = z.object({
  account: z.string(),
  newName: z.string(),
});

export async function handleRenameAccount({
  account,
  newName,
}: z.infer<typeof handleRenameAccountInputs>) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const renameResponse = await rpcClient.wallet.renameAccount({
    account,
    newName,
  });

  return renameResponse.content;
}
