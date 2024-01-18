import fs from "fs/promises";
import path from "path";

import { LOCALES } from "../renderer/intl/intl-constants";
import english from "../renderer/intl/locales/en-US.json";

// Removes old entries from locale files and logs new entries with the text
// from the en-US locale. Run with this:
//
// npm run translate:missing
async function main() {
  const englishKeys = new Set(Object.keys(english));

  for (const locale of LOCALES) {
    if (locale === "en-US") {
      continue;
    }
    const filepath = path.join(
      __dirname,
      `../renderer/intl/locales/${locale}.json`,
    );
    const data = JSON.parse(await fs.readFile(filepath, { encoding: "utf8" }));
    const dataKeys = new Set(Object.keys(data));

    // Delete keys that are no longer used
    for (const key of Object.keys(data)) {
      if (!englishKeys.has(key)) {
        delete data[key];
      }
    }

    await fs.writeFile(filepath, JSON.stringify(data, null, 2), {
      encoding: "utf8",
    });

    // Log to be translated
    const missing: Array<string> = [];
    for (const [key, value] of Object.entries(english)) {
      if (!dataKeys.has(key)) {
        missing.push(`${key}: ${value.message}`);
      }
    }

    if (missing.length) {
      console.log(`\n${locale}`);
      console.log(missing.join("\n"));
    }
  }
}

main();
