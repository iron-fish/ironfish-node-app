import { nativeTheme } from "electron";
import { z } from "zod";

import { getUserSettings, settingsZodSchema } from "./userSettings";
import { t } from "../trpc";

export const userSettingsRouter = t.router({
  getUserSetting: t.procedure
    .input(
      z.object({
        key: settingsZodSchema.keyof(),
      }),
    )
    .query(async (opts) => {
      const settings = await getUserSettings();
      return settings.get(opts.input.key);
    }),
  getUserSettings: t.procedure.query(async () => {
    const settings = await getUserSettings();
    return settings;
  }),
  setUserSettings: t.procedure
    .input(settingsZodSchema.partial())
    .mutation(async (opts) => {
      if (Object.hasOwn(opts.input, "theme") && opts.input.theme) {
        const themeValue = opts.input.theme;
        nativeTheme.themeSource = themeValue;
      }

      const settings = await getUserSettings();
      settings.set(opts.input);
    }),
});
