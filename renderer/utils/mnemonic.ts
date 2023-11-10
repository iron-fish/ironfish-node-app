export const MNEMONIC_ITEM_COUNT = 24;
export const EMPTY_MNEMONIC_ARRAY = Array.from(
  { length: MNEMONIC_ITEM_COUNT },
  () => "",
);

export function formatMnemonic(phrase: string | Array<string>) {
  const asString = Array.isArray(phrase) ? phrase.join(" ") : phrase;
  return asString.trim().replace(/\s+/g, " ");
}

export function validateMnemonic(
  phrase: string | Array<string>,
  comparePhrase?: string,
) {
  const formatted = formatMnemonic(phrase);

  const hasCorrectLength =
    formatted.match(/\s/g)?.length === MNEMONIC_ITEM_COUNT - 1;

  if (!hasCorrectLength) {
    return "Please fill out the entire phrase.";
  }

  if (typeof comparePhrase === "string" && !validateMnemonic(comparePhrase)) {
    throw new Error(
      "Invalid compare phrase. Please ensure compare phrase is a 24 word mnemonic phrase.",
    );
  }

  if (typeof comparePhrase === "string" && formatted !== comparePhrase) {
    return "The phrase you entered does not match. Please verify the phrase and try again.";
  }

  return null;
}
