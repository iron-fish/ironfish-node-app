import { z } from "zod";

import { handleGetAccount } from "./handleGetAccount";
import { handleGetAccounts } from "./handleGetAccounts";
import { t } from "../trpc";

export const accountRouter = t.router({
  getAccount: t.procedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .query(async (opts) => {
      return handleGetAccount(opts.input);
    }),
  getAccounts: t.procedure.query(handleGetAccounts),
});
