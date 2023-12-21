import Store, { Schema } from "electron-store";
import { z } from "zod";

import { t } from "../trpc";

const schema: Schema<{
  intl: {
    locale: string | null;
  };
}> = {
  intl: {
    type: "object",
    properties: {
      locale: { type: "string" },
    },
  },
};

const STORE_NAME = "intl";

const store = new Store({ schema, name: STORE_NAME });

export const intlRouter = t.router({
  getLocale: t.procedure.query(async () => {
    const intl = await store.get(STORE_NAME, { locale: null });
    return intl.locale;
  }),
  setLocale: t.procedure
    .input(
      z.object({
        locale: z.string(),
      }),
    )
    .mutation(async (opts) => {
      const intl = await store.get(STORE_NAME, { locale: null });
      const nextIntl = { ...intl, locale: opts.input.locale };
      store.set(STORE_NAME, nextIntl);
    }),
});
