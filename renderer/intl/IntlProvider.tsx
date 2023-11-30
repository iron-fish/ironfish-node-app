import { useRouter } from "next/router";
import { useMemo } from "react";
import { IntlProvider as ReactIntlProvider } from "react-intl";

import English from "./compiled-locales/en.json";
import Russian from "./compiled-locales/ru.json";

type Props = {
  children: React.ReactNode;
};

export function IntlProvider({ children }: Props) {
  const router = useRouter();
  const locale = router.locale ?? "en-US";
  const [shortLocale] = locale.split("-");

  const messages = useMemo(() => {
    switch (shortLocale) {
      case "en":
        return English;
      case "ru":
        return Russian;
      default:
        return English;
    }
  }, [shortLocale]);

  return (
    <ReactIntlProvider
      locale={locale}
      defaultLocale={router.defaultLocale}
      messages={messages}
    >
      {children}
    </ReactIntlProvider>
  );
}
