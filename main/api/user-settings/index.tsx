import { PartialUserSettingsSchema } from "./userSettings";
import { manager } from "../manager";
import { t } from "../trpc";

export const userSettingsRouter = t.router({
  getUserSetting: t.procedure.query(async () => {
    const settings = await manager.getUserSettings();
    return settings.config;
  }),
  setUserSetting: t.procedure
    .input(PartialUserSettingsSchema)
    .mutation(async (opts) => {
      const settings = await manager.getUserSettings();
      settings.setMany(opts.input);
      await settings.save();
    }),
});
