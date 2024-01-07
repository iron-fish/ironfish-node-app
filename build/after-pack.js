const axios = require("axios").default;
const { differenceInDays } = require("date-fns");
const fs = require("fs/promises");
const path = require("path");

exports.default = async function (context) {
  if (context.platform.buildConfigurationKey !== "win") {
    return;
  }

  const filePath = path.resolve(__dirname, "../resources/vc_redist.x64.exe");

  try {
    const stat = await fs.stat(filePath);
    const sizeInMB = stat.size / (1024 * 1024);
    // If it's more than 20MB and has been updated within 7 days, skip redownload.
    // More accurate way would be to check etag on the response.
    if (sizeInMB > 20 && differenceInDays(Date.now(), stat.mtime) < 7) {
      return;
    }
  } catch (e) {
    if (e.code !== "ENOENT") {
      throw e;
    }
  }

  console.log(`  • downloading vc_redist  file=${filePath}`);

  const result = await axios.get(
    "https://aka.ms/vs/17/release/vc_redist.x64.exe",
    {
      responseType: "stream",
    },
  );

  const handle = await fs.open(filePath, "w");
  const stream = handle.createWriteStream();
  result.data.pipe(stream);

  await new Promise((resolve) => stream.on("finish", () => resolve()));
  await handle.close();
};
