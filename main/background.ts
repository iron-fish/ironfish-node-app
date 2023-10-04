import path from "path";
import { app } from "electron";
import serve from "electron-serve";
import { createIPCHandler } from "electron-trpc/main";
import { createWindow } from "./create-window";
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

  const mainWindow = createWindow("main", {
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  mainWindow.maximize();

  createIPCHandler({ router, windows: [mainWindow] });

  if (isProd) {
    await mainWindow.loadURL("app://./home");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

app.on("window-all-closed", () => {
  app.quit();
});
