import { useMemo, useState } from "react";
import { IntlProvider as ReactIntlProvider } from "react-intl";

import English from "./compiled-locales/en.json";
import Spanish from "./compiled-locales/es.json";

type Props = {
  children: React.ReactNode;
};

const LANGUAGES = ["en", "es"];

const DEFAULT_LOCALE = "en-US";

function getLocale() {
  const locale = navigator.language ?? DEFAULT_LOCALE;
  return { locale, shortLocale: locale.split("-")[0] };
}

const SelectedLocaleContext = React.createContext({
  selectedLocale: "",
  setSelectedLocale: (locale: string) => {},
});

export function SelectedLocaleProvider({ children }: Props) {
  const [selectedLocale, setSelectedLocale] = useState(() => {
    const locale = navigator.language ?? DEFAULT_LOCALE;
    return { locale, shortLocale: locale.split("-")[0] };
  });

  const value = useMemo(
    () => ({
      selectedLocale,
      setSelectedLocale,
    }),
    [selectedLocale, setSelectedLocale],
  );

  return (
    <SelectedLocaleContext.Provider value={value}>
      {children}
    </SelectedLocaleContext.Provider>
  );
}

export function IntlProvider({ children }: Props) {
  const { shortLocale, locale } = getLocale();

  const messages = useMemo(() => {
    switch (shortLocale) {
      case "en":
        return English;
      case "es":
        return Spanish;
      default:
        return English;
    }
  }, [shortLocale]);

  return (
    <ReactIntlProvider
      locale={locale}
      defaultLocale={DEFAULT_LOCALE}
      messages={messages}
    >
      {children}
    </ReactIntlProvider>
  );
}
