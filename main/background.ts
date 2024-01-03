import { BrowserWindow, app, nativeTheme, crashReporter } from "electron";
import log from "electron-log";
import serve from "electron-serve";
import { createIPCHandler } from "electron-trpc/main";

import { router } from "./api";
import { manager } from "./api/manager";
import { mainWindow } from "./main-window";
import { updater } from "./updater";

const isProd: boolean = process.env.NODE_ENV === "production";

log.transports.file.level = "info";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

crashReporter.start({ uploadToServer: false });

const ironfish = await manager.getIronfish();
ironfish.init();

async function createWindow(handler: ReturnType<typeof createIPCHandler>) {
  const window = mainWindow.init();
  handler.attachWindow(window);

  window.once("ready-to-show", () => {
    window.maximize();
  });

  window.once("closed", () => {
    handler.detachWindow(window);
  });

  if (isProd) {
    await window.loadURL("app://./home");
  } else {
    const port = process.argv[2];
    await window.loadURL(`http://localhost:${port}/home`);
    window.webContents.openDevTools();
  }
}

async function createThemeChangeHandler() {
  const updateTitleBarOverlay = () => {
    mainWindow.getMainWindow().then((mw) => {
      if (nativeTheme.shouldUseDarkColors) {
        // setTitleBarOverlay is undefined on non-Windows platforms
        mw.setTitleBarOverlay?.({
          color: "#101010",
          symbolColor: "#ffffff",
        });
      } else {
        mw.setTitleBarOverlay?.({
          color: "#ffffff",
          symbolColor: "#101010",
        });
      }
    });
  };

  nativeTheme.on("updated", updateTitleBarOverlay);

  updateTitleBarOverlay();
}

app.whenReady().then(() => {
  if (isProd) {
    updater.init();
  }

  createThemeChangeHandler();

  const handler = createIPCHandler({ router });

  createWindow(handler);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(handler);
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("will-quit", (e) => {
  // Attempt to shut down the node gracefully before exiting the app
  if (ironfish.isStarted()) {
    e.preventDefault();
    ironfish.stop().then(() => {
      app.quit();
    });
  }
});
