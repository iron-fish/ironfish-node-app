import { nativeTheme } from "electron";
import { z } from "zod";

import {
  userSettingsStore,
  userSettingsZodSchema,
} from "../../stores/userSettingsStore";
import { t } from "../trpc";

export const userSettingsRouter = t.router({
  getUserSetting: t.procedure
    .input(
      z.object({
        key: userSettingsZodSchema.keyof(),
      }),
    )
    .query(async (opts) => {
      const result = await userSettingsStore.getSetting(opts.input.key);
      return result;
    }),
  setUserSettings: t.procedure
    .input(userSettingsZodSchema.partial())
    .mutation(async (opts) => {
      if (Object.hasOwn(opts.input, "theme") && opts.input.theme) {
        const themeValue = opts.input.theme;
        nativeTheme.themeSource = themeValue;
      }

      await userSettingsStore.setSettings(opts.input);
    }),
});
