import { useForm } from "react-hook-form";
import { defineMessages } from "react-intl";
import { z } from "zod";

import { Locales, useSelectedLocaleContext } from "@/intl/IntlProvider";
import { Select } from "@/ui/Forms/Select/Select";

const messages = defineMessages({
  langEnglish: {
    defaultMessage: "English",
  },
  langSpanish: {
    defaultMessage: "Spanish",
  },
  langChinese: {
    defaultMessage: "Chinese",
  },
  langIndonesian: {
    defaultMessage: "Bahasa Indonesia",
  },
  langRussian: {
    defaultMessage: "Russian",
  },
  langUkrainian: {
    defaultMessage: "Ukrainian",
  },
  langJavanese: {
    defaultMessage: "Bahasa Jawa",
  },
  chooseLanguage: {
    defaultMessage: "Choose your language",
  },
  selectLanguage: {
    defaultMessage: "Select language",
  },
  description: {
    defaultMessage:
      "The Iron Fish Node App supports {languageCount} languages. If your preferred language isn't listed, please reach out and let us know!",
  },
  close: {
    defaultMessage: "Close",
  },
});

const languageOptionsMap: {
  [K in Locales]: {
    message: (typeof messages)[keyof typeof messages];
    ownLanguageLabel: string;
    value: K;
  };
} = {
  "en-US": {
    message: messages.langEnglish,
    ownLanguageLabel: "English",
    value: "en-US",
  },
  "es-MX": {
    message: messages.langSpanish,
    ownLanguageLabel: "Español",
    value: "es-MX",
  },
  "zh-CN": {
    message: messages.langChinese,
    ownLanguageLabel: "中文",
    value: "zh-CN",
 },
  "id-ID": {
    message: messages.langIndonesian,
    ownLanguageLabel: "Bahasa Indonesia",
    value: "id-ID",  
  },
  "ru-RU": {
    message: messages.langRussian,
    ownLanguageLabel: "Русский",
    value: "ru-RU",
  },
  "uk-UA": {
    message: messages.langUkrainian,
    ownLanguageLabel: "Українська",
    value: "uk-UA",
  },
  "jv-ID": {
    message: messages.langJavanese,
    ownLanguageLabel: "Bahasa Jawa",
    value: "jv-ID",
  },
};

const languageOptions = Object.values(languageOptionsMap);

const localeSchema = z.object({
  language: z.enum(["en-US", "es-MX", "zh-CN", "id-ID", "ru-RU", "uk-UA", "jv-ID"]),
});

export function LanguageSelector() {
  const selectedLocaleContext = useSelectedLocaleContext();

  const options = languageOptions.map((option) => ({
    ...option,
    label: option.ownLanguageLabel,
  }));

  const { register, watch } = useForm<z.infer<typeof localeSchema>>({
    defaultValues: {
      language: selectedLocaleContext.locale,
    },
  });
  const selectedValue = watch("language");

  return (
    <Select
      {...register("language", {
        onChange: (e) => {
          selectedLocaleContext.setLocale(e.target.value);
        },
      })}
      label="Language"
      options={options}
      value={selectedValue}
    />
  );
}
