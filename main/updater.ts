import log from "electron-log/main";
import { autoUpdater } from "electron-updater";

autoUpdater.logger = log;

class Updater {
  init() {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

export const updater = new Updater();
