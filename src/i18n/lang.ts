import * as i18n from "@solid-primitives/i18n";

export type Locale = "en-US" | "zh-CN";
export const locales: string[] = ["en-US", "zh-CN"];
type RawDictionary = typeof import("./zh-CN.json");
export type Dictionary = i18n.Flatten<RawDictionary>;

export async function fetchDictionary(locale: Locale): Promise<Dictionary> {
  try {
    switch (locale) {
      case "en-US":
        return (await import("./en-US.json").then(i18n.flatten)) as Dictionary;
      case "zh-CN":
        return (await import("./zh-CN.json").then(i18n.flatten)) as Dictionary;
    }
  } catch (error) {
    console.error(`Failed to load dictionary for locale ${locale}:`, error);
    throw error;
  }
}
