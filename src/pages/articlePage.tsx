import { Component, createSignal, onMount, Show, Suspense } from "solid-js";
import { Button } from "../components/button";
import { SolidMarkdown } from "solid-markdown";
import { Card } from "../components/card";
import remarkGfm from "remark-gfm";

import "../components/markdown.css";
import Loading from "../components/loading";
import { loadConfig, saveConfig } from "../localStorage";

interface ArticlePageProps {
  translator: any;
  defaultArticle?: string;
  operations: {
    back: () => void;
  };
  getMethods: (setArticle: (info?: string) => void) => void;
}

const ArticlePage: Component<ArticlePageProps> = (props) => {
  const t = props.translator;

  const [isProper, setProper] = createSignal(true);
  const [content, setContent] = createSignal<string>();

  const setArticle = async (fileName?: string) => {
    if (!fileName) {
      setProper(false);
      return;
    }
    setContent("");
    const fileContent = await import(`../articles/${fileName}.md?raw`);
    if (fileContent.default) {
      setProper(true);
      setContent(fileContent.default);
      let newConfig = loadConfig();
      newConfig.currentArticle = fileName;
      saveConfig(newConfig);
    } else {
      setProper(false);
      let newConfig = loadConfig();
      newConfig.currentArticle = "";
      saveConfig(newConfig);
    }
  };
  props.getMethods(setArticle);

  onMount(() => {
    if (props.defaultArticle && props.defaultArticle !== "")
      setArticle(props.defaultArticle);
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
          when={isProper()}
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
              "--surface-default": "var(--surface-hover)",
            }}
          >
            <Show
              when={content()}
              fallback={
                <Loading
                  extraStyle={{
                    "margin-top": "2rem",
                  }}
                />
              }
            >
              <Suspense fallback={false}>
                <SolidMarkdown
                  class="markdown-body"
                  remarkPlugins={[remarkGfm]}
                  children={content()}
                />
              </Suspense>
            </Show>
          </Card>
        </Show>
      </div>
    </div>
  );
};
export default ArticlePage;
