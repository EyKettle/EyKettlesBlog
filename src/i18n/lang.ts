import * as i18n from "@solid-primitives/i18n";

export type Locale = "en" | "zh";
type RawDictionary = typeof import("./zh.json");
export type Dictionary = i18n.Flatten<RawDictionary>;

const dictionaryCache: { [key in Locale]: Promise<Dictionary> } = {
  en: import("./en.json").then(i18n.flatten),
  zh: import("./zh.json").then(i18n.flatten),
};

export async function fetchDictionary(locale: Locale): Promise<Dictionary> {
  try {
    return await dictionaryCache[locale];
  } catch (error) {
    console.error(`Failed to load dictionary for locale ${locale}:`, error);
    throw error;
  }
}
