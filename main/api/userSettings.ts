import { DEFAULT_DATA_DIR, KeyStore, NodeFileProvider } from "@ironfish/sdk";
import { app } from "electron";
import { z } from "zod";

export type UserSettings = {
  enabled: boolean;
  dataDir: string;
};

export const PartialUserSettingsSchema: z.ZodType<Partial<UserSettings>> = z
  .object({
    enabled: z.boolean(),
    dataDir: z.string(),
  })
  .partial();

export class UserSettingsStore extends KeyStore<UserSettings> {
  constructor(options: {
    fileSystem: NodeFileProvider;
    dataDir: string;
    fileName: string;
    defaults: UserSettings;
  }) {
    super(
      options.fileSystem,
      options.fileName,
      options.defaults,
      options.dataDir,
    );
  }
}

export async function loadUserSettings(): Promise<UserSettingsStore> {
  const fileSystem = new NodeFileProvider();
  await fileSystem.init();

  const userSettings = new UserSettingsStore({
    fileSystem,
    dataDir: app.getPath("userData"),
    fileName: "settings.json",
    defaults: {
      dataDir: fileSystem.resolve(DEFAULT_DATA_DIR),
      enabled: false,
    },
  });

  await userSettings.load();
  return userSettings;
}
