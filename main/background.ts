import {
  BrowserWindow,
  app,
  nativeTheme,
  crashReporter,
  Menu,
  MenuItem,
} from "electron";
import log from "electron-log";
import serve from "electron-serve";
import { createIPCHandler } from "electron-trpc/main";

import { router } from "./api";
import { migrateNodeAppBetaContacts } from "./api/contacts/utils/migrateNodeAppBetaContacts";
import { manager } from "./api/manager";
import { getUserSettings } from "./api/user-settings/userSettings";
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

async function createWindow(handler: ReturnType<typeof createIPCHandler>) {
  const window = mainWindow.init();
  handler.attachWindow(window);

  window.once("ready-to-show", () => {
    window.maximize();
  });

  if (isProd) {
    await window.loadURL("app://./home");
  } else {
    const port = process.argv[2];
    await window.loadURL(`http://localhost:${port}/home`);
    window.webContents.openDevTools();
  }
}

async function setNativeThemeSource() {
  const userSettings = await getUserSettings();
  nativeTheme.themeSource = userSettings.get("theme");
}

async function createThemeChangeHandler() {
  const updateTitleBarOverlay = () => {
    mainWindow.getMainWindow().then((mw) => {
      if (nativeTheme.shouldUseDarkColors) {
        // setTitleBarOverlay is undefined on non-Windows platforms
        mw.setTitleBarOverlay?.({
          color: "#10101022",
          symbolColor: "#ffffff",
        });
      } else {
        mw.setTitleBarOverlay?.({
          color: "#ffffff22",
          symbolColor: "#101010",
        });
      }
    });
  };

  nativeTheme.on("updated", updateTitleBarOverlay);

  updateTitleBarOverlay();
}

function setAppMenu() {
  const defaultMenu = Menu.getApplicationMenu();
  if (!defaultMenu) {
    log.warn("No default menu found");
    return;
  }

  const newMenu = new Menu();
  for (const menuItem of defaultMenu.items) {
    const newSubmenu = new Menu();

    const filteredMenu =
      menuItem.submenu?.items.filter(
        (subMenuItem) =>
          // We want to prevent the window from being reloaded since our dynamic routes aren't statically
          // generated. This causes the app to 404 if the user reloads on a dynamic route. We tried calling
          // preventDefault in beforeunload in the app and explicitly called window.destroy() in the window.close
          // event on the main process, but that caused a crash in electron-trpc when closing the app while a TRPC
          // subscription was active. Removing reload and forcereload also disables their keybindings, so it
          // should prevent users from reloading the app.
          // @ts-expect-error subMenuItem.role should be forcereload instead of forceReload
          subMenuItem.role != "reload" && subMenuItem.role != "forcereload",
      ) ?? [];
    for (const subMenuItem of filteredMenu) {
      newSubmenu.append(subMenuItem);
    }

    newMenu.append(
      new MenuItem({
        type: menuItem.type,
        label: menuItem.label,
        submenu: newSubmenu,
      }),
    );
  }

  Menu.setApplicationMenu(newMenu);
}

app.whenReady().then(() => {
  if (isProd) {
    updater.init();
  }

  createThemeChangeHandler();
  setNativeThemeSource();
  setAppMenu();
  migrateNodeAppBetaContacts();

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
