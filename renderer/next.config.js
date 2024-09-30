// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

/** @type {import('next').NextConfig} */
module.exports = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer, defaultLoaders }) => {
    if (!isServer) {
      config.target = "web";
      config.node = {
        __dirname: true,
      };
    }
    config.output.globalObject = "this";

    // Make the shared folder available to the renderer
    config.resolve.modules.push(path.resolve(__dirname, "../"));
    config.module.rules.push({
      test: /\.ts$/,
      include: path.resolve(__dirname, "../shared"),
      use: [defaultLoaders.babel],
    });

    return config;
  },
};
