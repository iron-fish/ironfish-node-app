/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require("webpack");

/*
 * This file contains patches for external modules that don't work correctly
 * in the current sytem. To add a patch, add an entry to the PATCHES object
 * where the key is the path to the file to be patched and the value is the
 * path to the patch file.
 *
 * Please place patch files in the patches directory.
 */

const PATCHES = {
  "node_modules/usb/dist/usb/bindings.js": "./patches/usb.js",
};

function applyPatches(webpackPlugins) {
  const plugins = webpackPlugins || [];

  for (const [key, value] of Object.entries(PATCHES)) {
    plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        new RegExp(escapeRegExp(key)),
        require.resolve(value),
      ),
    );
  }

  return plugins;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
  applyPatches,
};
