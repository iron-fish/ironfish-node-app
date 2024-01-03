import { DEFAULT_DATA_DIR, NodeFileProvider } from "@ironfish/sdk";
import Store, { Schema } from "electron-store";
import { z } from "zod";

const STORE_NAME = "user-settings";

export const settingsZodSchema = z.object({
  dataDir: z.string(),
  theme: z.enum(["light", "dark", "system"]),
  locale: z.string().nullable(),
});

export type SchemaDefinition = z.infer<typeof settingsZodSchema>;

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
