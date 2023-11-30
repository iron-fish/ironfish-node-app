import { z } from "zod";

import { mainWindow } from "../../main-window";
import { t } from "../trpc";

export type ThemeSettings = {
  theme: "light" | "dark" | "system";
};

export const ThemeSettingsSchema: z.ZodType<ThemeSettings> = z.object({
  theme: z.enum(["light", "dark", "system"]),
});

export const themeRouter = t.router({
  setTheme: t.procedure.input(ThemeSettingsSchema).mutation(async (opts) => {
    const mw = await mainWindow.getMainWindow();
    if (opts.input.theme === "dark") {
      mw.setTitleBarOverlay({
        color: "#111111",
        symbolColor: "#ADAEB4",
      });
    } else {
      mw.setTitleBarOverlay({
        color: "#ffffff",
        symbolColor: "#7F7F7F",
      });
    }
  }),
});
