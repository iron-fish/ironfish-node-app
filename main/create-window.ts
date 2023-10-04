/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  screen,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  Rectangle,
} from "electron";
import Store from "electron-store";

export const createWindow = (
  windowName: string,
  options: BrowserWindowConstructorOptions,
): BrowserWindow => {
  const key = "window-state";
  const name = `window-state-${windowName}`;
  const store = new Store<Rectangle>({ name });
  const defaultSize = {
    width: options.width,
    height: options.height,
  };
  let state = {};

  const restore = () => store.get(key, defaultSize);

  const getCurrentPosition = () => {
    const position = win.getPosition();
    const size = win.getSize();
    return {
      x: position[0],
      y: position[1],
      width: size[0],
      height: size[1],
    };
  };

  const windowWithinBounds = (
    windowState: { x?: number; y?: number; width: any; height: any },
    bounds: Electron.Rectangle,
  ) => {
    return (
      (windowState.x ?? 0) >= bounds.x &&
      (windowState.y ?? 0) >= bounds.y &&
      windowState.x + windowState.width <= bounds.x + bounds.width &&
      windowState.y + windowState.height <= bounds.y + bounds.height
    );
  };

  const resetToDefaults = () => {
    const bounds = screen.getPrimaryDisplay().bounds;
    return Object.assign({}, defaultSize, {
      x: (bounds.width - (defaultSize.width ?? 0)) / 2,
      y: (bounds.height - (defaultSize.height ?? 0)) / 2,
    });
  };

  const ensureVisibleOnSomeDisplay = (windowState: {
    width: any;
    height: any;
    x?: number;
    y?: number;
  }) => {
    const visible = screen.getAllDisplays().some((display) => {
      return windowWithinBounds(windowState, display.bounds);
    });
    if (!visible) {
      // Window is partially or fully not visible now.
      // Reset it to safe defaults.
      return resetToDefaults();
    }
    return windowState;
  };

  const saveState = () => {
    if (!win.isMinimized() && !win.isMaximized()) {
      Object.assign(state, getCurrentPosition());
    }
    store.set(key, state);
  };

  state = ensureVisibleOnSomeDisplay(restore());

  const win = new BrowserWindow({
    ...state,
    ...options,
    webPreferences: {
      ...options.webPreferences,
    },
  });

  win.on("close", saveState);

  return win;
};
