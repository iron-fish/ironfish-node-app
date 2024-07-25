import { DEFAULT_NETWORK_ID, NodeFileProvider } from "@ironfish/sdk";
import Store, { Schema } from "electron-store";
import { z } from "zod";

const STORE_NAME = "user-settings";

export const userSettingsZodSchema = z.object({
  networkId: z.number(),
  theme: z.enum(["light", "dark", "system"]),
  locale: z.string().nullable(),
});

export type SchemaDefinition = z.infer<typeof userSettingsZodSchema>;

export const schema: Schema<SchemaDefinition> = {
  networkId: {
    type: "number",
  },
  theme: {
    enum: ["light", "dark", "system"],
  },
  locale: {
    type: ["string", "null"],
  },
};

class UserSettingsStore {
  private store: Store<SchemaDefinition> | null = null;

  private getStore = async () => {
    if (!this.store) {
      const fileSystem = new NodeFileProvider();
      await fileSystem.init();

      this.store = new Store({
        name: STORE_NAME,
        schema,
        defaults: {
          networkId: DEFAULT_NETWORK_ID,
          theme: "system",
          locale: null,
        },
      });
    }

    return this.store;
  };

  getSetting = async <T extends keyof SchemaDefinition>(setting: T) => {
    const store = await this.getStore();
    return store.get(setting);
  };

  setSettings = async (settings: Partial<SchemaDefinition>) => {
    const store = await this.getStore();
    store.set(settings);
  };
}

export const userSettingsStore = new UserSettingsStore();
