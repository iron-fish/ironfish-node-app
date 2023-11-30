import { nativeTheme } from "electron";
import { z } from "zod";

import { t } from "../trpc";

export type ThemeSettings = {
  theme: "light" | "dark" | "system";
};

export const ThemeSettingsSchema: z.ZodType<ThemeSettings> = z.object({
  theme: z.enum(["light", "dark", "system"]),
});

export const themeRouter = t.router({
  setTheme: t.procedure.input(ThemeSettingsSchema).mutation(async (opts) => {
    nativeTheme.themeSource = opts.input.theme;
  }),
});
