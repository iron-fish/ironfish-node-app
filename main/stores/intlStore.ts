import Store, { Schema } from "electron-store";

const STORE_NAME = "intl";

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

class IntlStore {
  private store = new Store({ schema, name: STORE_NAME });

  getLocale = async () => {
    const intl = await this.store.get(STORE_NAME, { locale: null });
    return intl.locale;
  };

  setLocale = async (locale: string) => {
    const intl = await this.store.get(STORE_NAME, { locale: null });
    const nextIntl = { ...intl, locale };
    this.store.set(STORE_NAME, nextIntl);
  };
}

export const intlStore = new IntlStore();
