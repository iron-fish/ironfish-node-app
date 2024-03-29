import { DEFAULT_NETWORK_ID, NodeFileProvider } from "@ironfish/sdk";
import Store, { Schema } from "electron-store";
import { z } from "zod";

const STORE_NAME = "user-settings";

export const settingsZodSchema = z.object({
  networkId: z.number(),
  theme: z.enum(["light", "dark", "system"]),
  locale: z.string().nullable(),
});

export type SchemaDefinition = z.infer<typeof settingsZodSchema>;

export const settingsSchema: Schema<SchemaDefinition> = {
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

let settingsStore: Store<SchemaDefinition>;

export async function getUserSettings() {
  if (settingsStore) return settingsStore;

  const fileSystem = new NodeFileProvider();
  await fileSystem.init();

  settingsStore = new Store({
    schema: settingsSchema,
    name: STORE_NAME,
    defaults: {
      networkId: DEFAULT_NETWORK_ID,
      theme: "system",
      locale: null,
    },
  });

  return settingsStore;
}
