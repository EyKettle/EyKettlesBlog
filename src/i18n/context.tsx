import { NullableTranslator, translator } from "@solid-primitives/i18n";
import { Dictionary, fetchDictionary, Locale, locales } from "./lang";
import {
  Accessor,
  createContext,
  createResource,
  createSignal,
  useContext,
} from "solid-js";

interface I18nContextValue {
  t: NullableTranslator<Dictionary>;
  locale: Accessor<Locale>;
  switchLocale: (newLocale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue>();

export function I18nProvider(p: { children?: any }) {
  const [locale, setLocale] = createSignal<Locale>("zh-CN");

  const default_locale = navigator.language;
  if (locales.includes(default_locale)) setLocale(default_locale as Locale);
  else if (!default_locale.startsWith("zh")) setLocale("en-US");

  const [dict] = createResource(locale, fetchDictionary);
  const t = translator(dict);

  const switchLocale = (newLocale: Locale | string) => {
    if (locales.includes(newLocale)) setLocale(newLocale as Locale);
    else if (newLocale.startsWith("zh")) setLocale("zh-CN");
    else setLocale("en-US");
  };

  const contextValue: I18nContextValue = {
    t,
    locale,
    switchLocale,
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {p.children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("No i18n provider");
  return context;
}
