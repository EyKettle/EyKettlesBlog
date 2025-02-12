import { createSignal, onMount, type Component } from "solid-js";
import { Card } from "../components/card";
import { Button } from "../components/button";
import { VirtualizerHandle, VList } from "virtua/solid";
import { Article, getInfos } from "../articles/methods";
import Blocker from "../components/blocker";

interface ReadingPageProps {
  translator: any;
  operations: {
    back: () => void;
    setArticleInfo: (article: Article) => void;
  };
  getMethods: (savePosition: () => void, loadPosition: () => void) => void;
}

const ReadingPage: Component<ReadingPageProps> = (props) => {
  const t = props.translator;
  const backButton = (
    <Button
      icon={"\u{e10e}"}
      type="ghost"
      size="large"
      rounded={true}
      onClick={props.operations.back}
    />
  );

  const [articleInfos, setArticleInfos] = createSignal<[any, ...Article[]]>([
    backButton,
  ]);

  onMount(async () => {
    const infos = await getInfos();
    setArticleInfos([backButton, ...infos]);
  });

  let vlist: VirtualizerHandle | undefined;
  let position: number | undefined;
  const savePosition = () => {
    if (vlist) position = vlist.scrollOffset;
  };
  const loadPosition = () => {
    if (vlist) vlist.scrollTo(position ?? 0);
  };
  props.getMethods(savePosition, loadPosition);

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
        if (index === 0) {
          return (
            <>
              <Blocker style={{ height: "12rem" }} />
              <div
                style={{
                  "justify-self": "center",
                  "margin-block": "0.5rem",
                }}
              >
                {item}
              </div>
            </>
          );
        } else {
          const info = item as Article;
          return (
            <div
              style={{
                display: "flex",
                "flex-direction": "column",
                "justify-self": "center",
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
                width="min(80vw, 40rem)"
                effect="none"
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
