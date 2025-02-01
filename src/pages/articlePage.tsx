import {
  Component,
  createEffect,
  createSignal,
  Show,
  Suspense,
} from "solid-js";
import { Article } from "../articles/methods";
import { Button } from "../components/button";
import { SolidMarkdown } from "solid-markdown";
import { Card } from "../components/card";
import remarkGfm from "remark-gfm";

import "../components/markdown.css";

interface ArticlePageProps {
  translator: any;
  info?: Article;
  operations: {
    back: () => void;
  };
}

const ArticlePage: Component<ArticlePageProps> = (props) => {
  const t = props.translator;

  const [content, setContent] = createSignal<string>();

  createEffect(async () => {
    if (!props.info) return;
    const fileContent = await import(`../articles/${props.info.fileName}.ts`);
    setContent(fileContent.default);
  });

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        "padding-top": "12rem",
        "padding-bottom": "6rem",
        "align-items": "center",
        gap: "1rem",
        width: "100%",
        overflow: "scroll",
      }}
    >
      <Button
        icon={"\u{e10e}"}
        type="ghost"
        size="large"
        rounded={true}
        onClick={props.operations.back}
      />
      <div>
        <Show
          when={props.info}
          fallback={<div>{t("errors.emptyArticle")}</div>}
        >
          <Card
            disabled={true}
            width="90vw"
            extraStyle={{
              "padding-inline": "min(3rem, 1vw)",
              "padding-block": "1rem 3rem",
              "user-select": "text",
              "justify-content": "start",
              "align-items": "stretch",
              "text-align": "left",
              "text-wrap": "wrap",
              "background-color": "var(--surface-hover)",
            }}
          >
            <Suspense fallback={false}>
              <SolidMarkdown
                class="markdown-body"
                remarkPlugins={[remarkGfm]}
                children={content()}
              />
            </Suspense>
          </Card>
        </Show>
      </div>
    </div>
  );
};
export default ArticlePage;
