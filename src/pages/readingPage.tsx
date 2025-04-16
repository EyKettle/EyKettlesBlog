import { createSignal, onMount, type Component } from "solid-js";
import { Card } from "../components/card";
import { Button } from "../components/button";
import { VirtualizerHandle, VList } from "virtua/solid";
import { Article, getInfos } from "../articles/methods";
import Blocker from "../components/blocker";
import { backButton } from "../controls/templates";

interface ReadingPageProps {
  translator: any;
  operations: {
    back: () => void;
    setArticleInfo: (article: Article) => void;
  };
}

const ReadingPage: Component<ReadingPageProps> = (props) => {
  const t = props.translator;
  const [articleInfos, setArticleInfos] = createSignal<Article[]>([]);

  onMount(
    () =>
      new Promise(async (resolve) => {
        const infos = await getInfos();
        setArticleInfos(infos);
        resolve(null);
      })
  );

  let vlist: VirtualizerHandle | undefined;

  return (
    <VList
      ref={(e) => (vlist = e)}
      data={articleInfos()}
      style={{
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        height: "100%",
      }}
    >
      {(item, index) => {
        const info = item as Article;
        if (index === 0) {
          return (
            <div
              style={{
                display: "grid",
                "flex-direction": "column",
                "justify-content": "center",
                "margin-block": "0.5rem",
              }}
            >
              <Blocker style={{ height: "8rem" }} />
              <div
                style={{
                  display: "grid",
                  "place-items": "center",
                  "margin-bottom": "1rem",
                }}
              >
                {backButton(props.operations.back)}
              </div>
              <Card
                title={info.title}
                description={info.description}
                onClick={() => {
                  props.operations.setArticleInfo(info);
                  return true;
                }}
                textJustify="flex-end"
                textAlign="flex-start"
                height="min(50vw, 18rem)"
                width="min(80vw, 50rem)"
                effect="3d"
              />
            </div>
          );
        } else {
          return (
            <div
              style={{
                display: "grid",
                "flex-direction": "column",
                "justify-content": "center",
                "margin-block": "0.5rem",
              }}
            >
              <Card
                title={info.title}
                description={info.description}
                onClick={() => {
                  props.operations.setArticleInfo(info);
                  return true;
                }}
                textJustify="flex-end"
                textAlign="flex-start"
                height="min(50vw, 18rem)"
                width="min(80vw, 50rem)"
                effect="3d"
              />
              {index === articleInfos().length - 1 ? (
                <Blocker style={{ height: "6rem" }} />
              ) : null}
            </div>
          );
        }
      }}
    </VList>
  );
};

export default ReadingPage;
