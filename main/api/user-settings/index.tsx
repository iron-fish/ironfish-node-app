import { nativeTheme } from "electron";
import { z } from "zod";

import { PartialUserSettingsSchema } from "./userSettings";
import { grabbyUserSettings, settingsKeys } from "./userSettingsAlt";
import { t } from "../trpc";

export const userSettingsRouter = t.router({
  getUserSetting: t.procedure
    .input(
      z.object({
        key: z.enum(settingsKeys),
      }),
    )
    .query(async (opts) => {
      const settings = await grabbyUserSettings();
      return settings.get(opts.input.key);
    }),
  getUserSettings: t.procedure.query(async () => {
    const settings = await grabbyUserSettings();
    return settings;
  }),
  setUserSettings: t.procedure
    .input(PartialUserSettingsSchema)
    .mutation(async (opts) => {
      if (Object.hasOwn(opts.input, "theme") && opts.input.theme) {
        const themeValue = opts.input.theme;
        nativeTheme.themeSource = themeValue;
      }

      const settings = await grabbyUserSettings();
      settings.set(opts.input);
    }),
});
