import { useMemo } from "react";
import { IntlProvider as ReactIntlProvider } from "react-intl";

import English from "./compiled-locales/en.json";
import Spanish from "./compiled-locales/es.json";

type Props = {
  children: React.ReactNode;
};

const DEFAULT_LOCALE = "en-US";

function getLocale() {
  const locale = navigator.language ?? DEFAULT_LOCALE;
  return { locale, shortLocale: locale.split("-")[0] };
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
