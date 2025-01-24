import { app, dialog } from "electron";
import log from "electron-log/main";

import { mainWindow } from "../../main-window";
import { t } from "../trpc";

export const windowRouter = t.router({
  openDirectoryDialog: t.procedure.query(async () => {
    const window = await mainWindow.getMainWindow();

    try {
      const { canceled, filePaths } = await dialog.showOpenDialog(window, {
        properties: ["openDirectory"],
      });
      if (canceled) {
        return;
      }
      return filePaths[0];
    } catch (e) {
      log.error(e);
    }

    return;
  }),
  relaunchApp: t.procedure.mutation(async () => {
    app.relaunch();
    app.exit();
  }),
});
