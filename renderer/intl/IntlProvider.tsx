import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { IntlProvider as ReactIntlProvider } from "react-intl";

import { trpcReact } from "@/providers/TRPCProvider";

import English from "./compiled-locales/en-US.json";
import Spanish from "./compiled-locales/es-MX.json";
import Russian from "./compiled-locales/ru-RU.json";
import Ukrainian from "./compiled-locales/uk-UA.json";
import Chinese from "./compiled-locales/zh-CN.json";
import { LOCALES, DEFAULT_LOCALE } from "./intl-constants";

export type Locales = (typeof LOCALES)[number];

const SelectedLocaleContext = createContext<{
  locale: Locales;
  setLocale: (locale: Locales) => void;
}>({
  locale: "en-US",
  setLocale: (_locale: Locales) => {},
});

export function useSelectedLocaleContext() {
  return useContext(SelectedLocaleContext);
}

function getLocaleFromNavigator() {
  const language = navigator.language;
  if (LOCALES.includes(language as Locales)) {
    return language;
  }

  const shortLanguage = language.split("-")[0];
  const match = LOCALES.find((locale) =>
    locale.startsWith(shortLanguage + "-"),
  );

  return match ?? DEFAULT_LOCALE;
}

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const { data: storedLocale, isFetched } = trpcReact.getUserSetting.useQuery({
    key: "locale",
  });
  const { mutate: setUserSettings } = trpcReact.setUserSettings.useMutation();
  const [selectedLocale, setSelectedLocale] = useState<Locales | null>(null);

  useEffect(() => {
    if (!isFetched) {
      return;
    }

    const locale = (storedLocale ?? getLocaleFromNavigator()) as Locales;
    setSelectedLocale(locale);
  }, [isFetched, storedLocale]);

  const messages = useMemo(() => {
    switch (selectedLocale) {
      case "en-US":
        return English;
      case "es-MX":
        return Spanish;
      case "ru-RU":
        return Russian;
      case "uk-UA":
        return Ukrainian;
      case "zh-CN":
        return Chinese;
      default:
        return English;
    }
  }, [selectedLocale]);

  const handleSetLocale = useCallback(
    (locale: Locales) => {
      setSelectedLocale(locale);
    },
    [setSelectedLocale],
  );

  useEffect(() => {
    if (!selectedLocale) {
      return;
    }

    setUserSettings({
      locale: selectedLocale,
    });
  }, [selectedLocale, setUserSettings]);

  return (
    <SelectedLocaleContext.Provider
      value={{
        locale: selectedLocale ?? DEFAULT_LOCALE,
        setLocale: handleSetLocale,
      }}
    >
      {selectedLocale && (
        <ReactIntlProvider
          locale={selectedLocale}
          defaultLocale={DEFAULT_LOCALE}
          messages={messages}
        >
          {children}
        </ReactIntlProvider>
      )}
    </SelectedLocaleContext.Provider>
  );
}
