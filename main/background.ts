import path from "path";
import { app } from "electron";
import serve from "electron-serve";
import { createIPCHandler } from "electron-trpc/main";
import { mainWindow } from "./main-window";
import { router } from "./api";
import { ironfish } from "./api/ironfish";

const isProd: boolean = process.env.NODE_ENV === "production";
ironfish.init();

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();

  const window = mainWindow.init();
  window.maximize();

  createIPCHandler({ router, windows: [window] });

  if (isProd) {
    await window.loadURL("app://./home");
  } else {
    const port = process.argv[2];
    await window.loadURL(`http://localhost:${port}/home`);
    window.webContents.openDevTools();
  }
})();

app.on("window-all-closed", () => {
  app.quit();
});
