module.exports = {
  webpack: (defaultConfig) => {
    return Object.assign(defaultConfig, {
      entry: {
        background: "./main/background.ts",
        preload: "./main/preload.ts",
      },
    });
  },
};
