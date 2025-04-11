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
import { Article, getInfos } from "../articles/methods";
import { backButton } from "../controls/templates";

interface ArticlePageProps {
  translator: any;
  defaultArticle?: string;
  operations: {
    back: () => void;
  };
  getMethods: (
    setArticle: (info?: Article) => Promise<void>,
    savePosition: () => void,
    loadPosition: () => void
  ) => void;
}

const ArticlePage: Component<ArticlePageProps> = (props) => {
  const t = props.translator;

  const [articleInfo, setArticleInfo] = createSignal<Article | null>(null);
  const [isProper, setProper] = createSignal(true);
  const [content, setContent] = createSignal<string>();
  let frontFile = "";
  const [imgProps, setImgProps] = createSignal({
    src: "",
    height: 0,
    width: 0,
  });

  const setArticle = (info?: Article) =>
    new Promise<void>(async (resolve) => {
      if (!info) {
        setProper(false);
        setArticleInfo(null);
        return;
      }
      setArticleInfo(info);
      const { fileName } = info;
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

        if (info.author === "EyKettle") {
          setImgProps({
            src: "/profiles/EyKettle_256px.png",
            height: 24,
            width: 24,
          });
        }
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
      resolve();
    });
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
    if (props.defaultArticle && props.defaultArticle !== "") {
      getInfos().then((articles) => {
        setArticle(
          articles.find((article) => article.fileName === props.defaultArticle)
        );
      });
    }
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
        "padding-top": "8.5rem",
        "padding-bottom": "6rem",
        "align-items": "center",
        gap: "1rem",
        "box-sizing": "border-box",
        height: "100%",
        width: "100%",
        overflow: "scroll",
      }}
    >
      {backButton(props.operations.back)}
      <div
        style={{
          display: "grid",
          gap: "0.5rem",
        }}
      >
        <Show
          when={isProper()}
          fallback={<div>{t("errors.emptyArticle")}</div>}
        >
          <div
            style={{
              display: "inline-flex",
              gap: "0.25rem",
              "justify-content": "end",
              "align-items": "center",
              "vertical-align": "middle",
              "margin-right": "0.75rem",
            }}
          >
            <Show when={articleInfo()} fallback={"querying..."}>
              <svg
                viewBox="0 0 32 32"
                height={18}
                width={18}
                style={{ opacity: 0.6 }}
                fill="var(--color-theme-text)"
              >
                <path d="M16,2c-7.73,0-14,6.27-14,14s6.27,14,14,14,14-6.27,14-14S23.73,2,16,2ZM16,28c-6.62,0-12-5.38-12-12s5.38-12,12-12,12,5.38,12,12-5.38,12-12,12Z" />
                <path d="M21,16h-4v-8c0-.55-.45-1-1-1s-1,.45-1,1v9c0,.55.45,1,1,1h5c.55,0,1-.45,1-1s-.45-1-1-1Z" />
              </svg>
              <label
                style={{
                  display: "inline",
                  opacity: 0.6,
                  translate: "0 -1px",
                }}
              >
                {articleInfo()!.date}
              </label>
              <div
                style={{
                  display: "inline",
                  padding: "0.375rem 0.5rem",
                  "padding-bottom": "0.5rem",
                  "padding-right": "0.75rem",
                  "margin-left": "0.5rem",
                  "border-radius": "0.75rem",
                  opacity: 0.6,
                  "transition-property":
                    "background-color, border-color, opacity",
                  "transition-duration": "0.2s",
                  "transition-timing-function": "cubic-bezier(0.5, 0.2, 0, 1)",
                }}
                on:mouseenter={(e) => {
                  const target = e.target as HTMLDivElement;
                  target.style.backgroundColor = "var(--color-surface-hover)";
                  target.style.opacity = "1";
                }}
                on:mouseleave={(e) => {
                  const target = e.target as HTMLDivElement;
                  target.style.backgroundColor = "transparent";
                  target.style.opacity = "0.6";
                }}
                on:touchstart={(e) => {
                  const target = e.target as HTMLDivElement;
                  target.style.backgroundColor = "var(--color-surface-hover)";
                  target.style.opacity = "1";
                }}
                on:touchend={(e) => {
                  const target = e.target as HTMLDivElement;
                  target.style.backgroundColor = "transparent";
                  target.style.opacity = "0.6";
                }}
              >
                <img
                  id="author-avatar"
                  alt="Author"
                  src={imgProps().src}
                  height={imgProps().height}
                  width={imgProps().width}
                  style={{
                    "clip-path": "circle()",
                    "pointer-events": "none",
                    "vertical-align": "text-bottom",
                    "margin-right": "0.25rem",
                  }}
                />
                <label
                  style={{
                    "font-size": "1.25rem",
                    "font-weight": "bold",
                    "pointer-events": "none",
                  }}
                >
                  {articleInfo()!.author}
                </label>
              </div>
            </Show>
          </div>
          <Card
            disabled={true}
            width="90vw"
            style={{
              "background-color": "var(--color-surface-hover)",
              "padding-inline": "max(1.5rem, 3vw)",
              "padding-block": "1rem 2rem",
              "user-select": "text",
              "-webkit-user-select": "text",
              "-moz-user-select": "text",
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
                  style={{
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
