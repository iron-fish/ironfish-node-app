import log from "electron-log/main";
import { autoUpdater } from "electron-updater";

import { isUnsupportedMacOS } from "./api/utils/osSupport";

autoUpdater.logger = log;

class Updater {
  init() {
    // Newer releases require macOS 13+ and would fail to launch after updating.
    if (isUnsupportedMacOS()) {
      log.warn(
        `Skipping auto-update: macOS ${process.getSystemVersion()} is not supported by newer releases`,
      );
      return;
    }
    autoUpdater.checkForUpdatesAndNotify();
  }
}

export const updater = new Updater();
