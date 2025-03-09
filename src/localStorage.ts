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

type ArticlePos = {
  filename: string;
  position: number;
  timestamp: number;
};

const MaxArticleHistory = 50;

const loadArticleHistory = (): ArticlePos[] => {
  const savedHistory = localStorage.getItem("articleHistory");
  return savedHistory ? JSON.parse(savedHistory) : [];
};

export const updateArticleHistory = (filename: string, position: number) => {
  const articleHistory = loadArticleHistory();
  const now = Date.now();
  const existingIndex = articleHistory.findIndex(
    (p) => p.filename === filename
  );

  if (existingIndex !== -1) {
    articleHistory[existingIndex].position = position;
    articleHistory[existingIndex].timestamp = now;
  } else {
    articleHistory.push({ filename, position, timestamp: now });
    if (articleHistory.length > MaxArticleHistory) {
      articleHistory.sort((a, b) => b.timestamp - a.timestamp);
      articleHistory.shift();
    }
  }
  localStorage.setItem("articleHistory", JSON.stringify(articleHistory));
};

export const checkArticlePos = (filename: string): number => {
  if (filename === "") return 0;
  const articleHistory = loadArticleHistory();
  const existingIndex = articleHistory.findIndex(
    (p) => p.filename === filename
  );
  if (existingIndex !== -1) {
    return articleHistory[existingIndex].position;
  } else {
    return 0;
  }
};
