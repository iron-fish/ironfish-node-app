import fs from "fs";
import path from "path";

import { config as dotenvConfig } from "dotenv";
import { isWithinTokenLimit } from "gpt-tokenizer";
import { OpenAI } from "openai";

import english from "../renderer/intl/locales/en.json";

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

const languages = ["es-MX"];

async function main() {
  // Chunk out content to prevent hitting the token limit.
  // Note that the limit is currently far below the actual limit.
  const englishChunks = createContentChunks(english);

  // Translate each language and write result to file
  for (const language of languages) {
    console.log(`Begin translation to ${language}`);
    let translatedContent = {};

    let currentChunk = 0;

    for await (const chunk of englishChunks) {
      console.log(`Translating chunk ${++currentChunk} of ${language}`);
      console.time("Translated chunk in: ");

      const translation = await translate(chunk, language);
      translatedContent = {
        ...translatedContent,
        ...translation,
      };
      console.timeEnd("Translated chunk in: ");
    }

    // Add original message to each translated entry's description
    addOriginalMessageAsDescription(translatedContent, language);

    // Write result to file
    const languageCode = language.split("-")[0];
    console.log(`Writing translation to ${languageCode}.json`);

    fs.writeFileSync(
      path.join(__dirname, `../renderer/intl/locales/${languageCode}.json`),
      JSON.stringify(translatedContent, null, 2),
    );
  }
}

main();
