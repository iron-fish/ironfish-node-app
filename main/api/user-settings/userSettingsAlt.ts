import { DEFAULT_DATA_DIR, NodeFileProvider } from "@ironfish/sdk";
import Store, { Schema } from "electron-store";

const STORE_NAME = "user-settings";

export type SchemaDefinition = {
  dataDir: string;
  theme: "light" | "dark" | "system";
  locale: string | null;
};

export const settingsSchema: Schema<SchemaDefinition> = {
  dataDir: {
    type: "string",
  },
  theme: {
    enum: ["light", "dark", "system"],
  },
  locale: {
    type: "string",
  },
};

export const settingsKeys = ["dataDir", "theme", "locale"] as const;

let settingsStore: Store<SchemaDefinition>;

export async function grabbyUserSettings() {
  if (settingsStore) return settingsStore;

  const fileSystem = new NodeFileProvider();
  await fileSystem.init();

  settingsStore = new Store({
    schema: settingsSchema,
    name: STORE_NAME,
    defaults: {
      dataDir: fileSystem.resolve(DEFAULT_DATA_DIR),
      theme: "system",
      locale: null,
    },
  });

  return settingsStore;
}
