module.exports = {
  webpack: (defaultConfig, env) => {
    return Object.assign(defaultConfig, {
      entry: {
        background: "./main/background.ts",
        preload: "./main/preload.ts",
      },
    });
  },
};
