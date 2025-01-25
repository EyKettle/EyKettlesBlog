export type Article = {
  title: string;
  description: string;
  image: string;
  date: string;
  author: string;
  fileName: string;
};

type Infos = {
  articles: Article[];
};

export async function getInfos() {
  const infos: Infos = await import("./infos.json");
  return infos.articles;
}
