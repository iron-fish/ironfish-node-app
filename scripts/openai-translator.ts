import fs from "fs";
import path from "path";

import { config as dotenvConfig } from "dotenv";
import { isWithinTokenLimit } from "gpt-tokenizer";
import { OpenAI } from "openai";

import { LOCALES, Locale } from "../renderer/intl/intl-constants";
import english from "../renderer/intl/locales/en-US.json";

dotenvConfig();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TOKEN_LIMIT = Math.floor(4096 / 2);

const SYSTEM_PROMPT = `
Task: Translate the provided text into the specified language. The input will be a JSON object where each key is a random ID. The value for each key is another object with keys 'message' and optionally 'description'. Translate the text in 'message' and 'description' fields into the given target language. Return the translations in the same JSON structure.

Input Format:
{
  "random-id1": {
    "message": "Text to be translated",
    "description": "Optional additional context"
  },
  "random-id2": {
    "message": "Another text to be translated"
  },
  // more entries can follow
}
Target Language: [Target Language Code]

Expected Output:
- Maintain the original JSON structure.
- Replace the 'message' text with its translation.
- Do not include 'description' in the output.
- Any text that is wrapped in curly braces, should be left as-is.
- Ensure accuracy and context-appropriate translation.
- If any JSON errors exist, return a JSON object with a single key 'error' and value 'Invalid JSON'.

Example:
Input:
{
  "001": {
    "message": "Welcome to our website",
    "description": "Greeting message on the homepage"
  },
  "002": {
    "message": "Contact us for more information"
  },
  "003": {
    "message": "Hello, {name}!"
  }
}
Target Language: fr-FR

Expected Output:
{
  "001": {
    "message": "Bienvenue sur notre site web",
  },
  "002": {
    "message": "Contactez-nous pour plus d'informations"
  },
  "003": {
    "message": "Bonjour, {name}!"
  }
}
`;

type JSONContent = {
  [key: string]: {
    message: string;
    description?: string;
  };
};

async function translate(content: JSONContent, targetLanguage: string) {
  const result = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: `${JSON.stringify(
          content,
          null,
          2,
        )}\nTarget Language: ${targetLanguage}`,
      },
    ],
  });

  const translationText = result.choices[0].message.content;

  if (!translationText) {
    throw new Error("No translation text returned");
  }

  return JSON.parse(translationText);
}

function createContentChunks(content: JSONContent) {
  const entries = Object.entries(content);
  const chunks: JSONContent[] = [];
  let currentChunk: JSONContent = {};

  for (const [key, value] of entries) {
    const messageLength = value.message.length;
    const totalLength = JSON.stringify(currentChunk).length + messageLength;

    if (
      isWithinTokenLimit(JSON.stringify(currentChunk), TOKEN_LIMIT) &&
      totalLength <= TOKEN_LIMIT
    ) {
      currentChunk[key] = value;
    } else {
      chunks.push(currentChunk);
      currentChunk = { [key]: value };
    }
  }

  chunks.push(currentChunk);

  return chunks;
}

function addOriginalMessageAsDescription(
  translation: JSONContent,
  language: string,
) {
  Object.entries(english).forEach(([key, value]) => {
    const isValidEntry =
      Object.hasOwn(translation, key) &&
      typeof translation[key].message === "string" &&
      translation[key].message.length > 0;

    if (!isValidEntry) {
      throw new Error(
        `Invalid translation for key ${key} in language ${language}`,
      );
    }

    translation[key].description = value.message;
  });
}

function assertLocale(str: string): asserts str is (typeof LOCALES)[number] {
  if (!(LOCALES as ReadonlyArray<string>).includes(str)) {
    throw new Error(`Invalid locale: ${str}`);
  }
}

// Translate all locales:
// npm run translate
//
// Translate a specific locales:
// npm run translate -- --locale=es-MX
async function main() {
  let locales: ReadonlyArray<Locale> = LOCALES;

  const args = process.argv.slice(2);
  const specifiedLocale = args.find((arg) => arg.startsWith("--locale="));

  if (specifiedLocale) {
    const locale = specifiedLocale.split("=")[1];
    assertLocale(locale);
    locales = [locale];
  }

  // Chunk out content to prevent hitting the token limit.
  // Note that the limit is currently far below the actual limit.
  const englishChunks = createContentChunks(english);

  // Translate each language and write result to file
  for (const locale of locales) {
    console.log(`Begin translation to ${locale}`);
    let translatedContent = {};

    let currentChunk = 0;

    for await (const chunk of englishChunks) {
      console.log(`Translating chunk ${++currentChunk} of ${locale}`);
      console.time("Translated chunk in: ");

      const translation = await translate(chunk, locale);
      translatedContent = {
        ...translatedContent,
        ...translation,
      };
      console.timeEnd("Translated chunk in: ");
    }

    // Add original message to each translated entry's description
    addOriginalMessageAsDescription(translatedContent, locale);

    // Write result to file
    console.log(`Writing translation to ${locale}.json`);

    fs.writeFileSync(
      path.join(__dirname, `../renderer/intl/locales/${locale}.json`),
      JSON.stringify(translatedContent, null, 2),
    );
  }
}

main();
