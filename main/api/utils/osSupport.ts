import os from "os";

// Darwin 22 is macOS 13 (Ventura), the minimum macOS supported by Electron 44+.
const MIN_DARWIN_MAJOR_VERSION = 22;

export function isUnsupportedMacOS(): boolean {
  if (process.platform !== "darwin") {
    return false;
  }
  const darwinMajorVersion = parseInt(os.release().split(".")[0], 10);
  return darwinMajorVersion < MIN_DARWIN_MAJOR_VERSION;
}
