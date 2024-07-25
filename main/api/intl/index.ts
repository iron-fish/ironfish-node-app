import { z } from "zod";

import { intlStore } from "../../stores/intlStore";
import { t } from "../trpc";

export const intlRouter = t.router({
  getLocale: t.procedure.query(async () => {
    const result = await intlStore.getLocale();
    return result;
  }),
  setLocale: t.procedure
    .input(
      z.object({
        locale: z.string(),
      }),
    )
    .mutation(async (opts) => {
      await intlStore.setLocale(opts.input.locale);
    }),
});
