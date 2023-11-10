import log from "electron-log";
import * as z from "zod";

import { manager } from "../manager";

export const handleImportAccountInputs = z.object({
  name: z.string().optional(),
  account: z.string(),
});

export async function handleImportAccount({
  name,
  account,
}: z.infer<typeof handleImportAccountInputs>) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  try {
    const importResponse = await rpcClient.wallet.importAccount({
      name,
      account,
    });

    return importResponse.content;
  } catch (error: unknown) {
    log.error(error);

    throw new Error(
      "Failed to import account, please verify your inputs and try again.",
    );
  }
}
