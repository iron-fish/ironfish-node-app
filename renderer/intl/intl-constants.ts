export const DEFAULT_LOCALE = "en-US";
export const LOCALES = ["en-US", "es-MX", "zh-CN", "ru-RU", "uk-UA"] as const;
export type Locale = (typeof LOCALES)[number];
