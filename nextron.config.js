/* eslint-disable @typescript-eslint/no-var-requires */

const { applyPatches } = require("./module-patches");

module.exports = {
  webpack: (defaultConfig) => {
    return Object.assign(defaultConfig, {
      entry: {
        background: "./main/background.ts",
        preload: "./main/preload.ts",
      },
      plugins: applyPatches(defaultConfig.plugins),
    });
  },
};
