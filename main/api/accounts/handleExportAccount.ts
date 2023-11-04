import { AccountFormat } from "@ironfish/sdk";
import * as z from "zod";

import { manager } from "../manager";

export const handleExportAccountInputs = z.object({
  name: z.string(),
  format: z.custom<`${AccountFormat}`>((format) => {
    return typeof format === "string" && format in AccountFormat;
  }),
  viewOnly: z.boolean().optional(),
});

export async function handleExportAccount({
  name,
  format,
  viewOnly = false,
}: z.infer<typeof handleExportAccountInputs>) {
  const ironfish = await manager.getIronfish();
  const rpcClient = await ironfish.rpcClient();

  const exportResponse = await rpcClient.wallet.exportAccount({
    account: name,
    format: AccountFormat[format],
    viewOnly,
  });

  return exportResponse.content;
}
