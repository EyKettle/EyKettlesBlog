export type Config = {
  language: string;
  pageIndex: number;
  currentArticle: string;
};

export const saveConfig = (config: Config) => {
  localStorage.setItem("config", JSON.stringify(config));
};

export const loadConfig = (): Config => {
  const savedConfig = localStorage.getItem("config");
  if (savedConfig) return JSON.parse(savedConfig);
  else
    return {
      language: "zh-CN",
      pageIndex: 1,
      currentArticle: "",
    };
};
