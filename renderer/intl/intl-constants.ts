export const DEFAULT_LOCALE = "en-US";
export const LOCALES = [
  "en-US",
  "es-MX",
  "zh-CN",
  "id-ID",
  "ru-RU",
  "uk-UA",
  "jv-ID",
] as const;
export type Locale = (typeof LOCALES)[number];
