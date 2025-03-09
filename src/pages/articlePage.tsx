import {
  Component,
  createSignal,
  onCleanup,
  onMount,
  Show,
  Suspense,
} from "solid-js";
import { Button } from "../components/button";
import { SolidMarkdown } from "solid-markdown";
import { Card } from "../components/card";
import remarkGfm from "remark-gfm";

import "../components/markdown.css";
import Loading from "../components/loading";
import {
  checkArticlePos,
  loadConfig,
  saveConfig,
  updateArticleHistory,
} from "../localStorage";

interface ArticlePageProps {
  translator: any;
  defaultArticle?: string;
  operations: {
    back: () => void;
  };
  getMethods: (
    setArticle: (info?: string) => void,
    savePosition: () => void,
    loadPosition: () => void
  ) => void;
}

const ArticlePage: Component<ArticlePageProps> = (props) => {
  const t = props.translator;

  const [isProper, setProper] = createSignal(true);
  const [content, setContent] = createSignal<string>();
  let frontFile = "";

  const setArticle = async (fileName?: string) => {
    if (!fileName) {
      setProper(false);
      return;
    }
    if (frontFile === fileName) {
      return;
    } else frontFile = fileName;
    setContent("");
    const fileContent =
      fileName === "new"
        ? (await import("../articles/new.md?raw")).default
        : await fetch(`./articles/${fileName}.md`).then((res) => res.text());
    if (fileContent) {
      setProper(true);
      setContent(fileContent);
      let newConfig = loadConfig();
      newConfig.currentArticle = fileName;
      saveConfig(newConfig);
    } else {
      setProper(false);
      let newConfig = loadConfig();
      newConfig.currentArticle = "";
      saveConfig(newConfig);
    }
    if (isProper()) {
      loadPosition();
    } else {
      console.warn("Lost article position by improper loading");
    }
  };
  let pageContent: HTMLDivElement | null = null;
  let position = 0;
  const minSaveDistance = 100;
  const minSaveInterval = 5000;
  const savePosition = () => {
    if (pageContent) {
      const lastPos = position;
      position = pageContent.scrollTop;
      const now = Date.now();
      if (
        Math.abs(position - lastPos) < minSaveDistance &&
        now - lastSaveTime < minSaveInterval
      )
        return;
      updateArticleHistory(frontFile, position);
      lastSaveTime = now;
    }
  };
  const loadPosition = () => {
    if (pageContent && content()) {
      const savedPos = checkArticlePos(frontFile);
      if (savedPos > 0) position = savedPos;
      pageContent.scrollTop = position;
    }
  };
  props.getMethods(setArticle, savePosition, loadPosition);

  let debounceTimer: number | undefined;
  let lastSaveTime = 0;
  const debounceDelay = 1000;
  const handleScroll = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      savePosition();
    }, debounceDelay);
  };

  onMount(() => {
    if (props.defaultArticle && props.defaultArticle !== "")
      setArticle(props.defaultArticle);
    pageContent && pageContent.addEventListener("scroll", handleScroll);
  });
  onCleanup(() => {
    pageContent && pageContent.removeEventListener("scroll", handleScroll);
  });

  return (
    <div
      ref={(e) => (pageContent = e)}
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
            style={{
              "--squircle-fill": "var(--surface-hover)",
              "padding-inline": "min(3rem, 1vw)",
              "padding-block": "1rem 3rem",
              "user-select": "text",
              "justify-content": "start",
              "align-items": "stretch",
              "text-align": "left",
              "text-wrap": "wrap",
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
