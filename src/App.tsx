import {
  createEffect,
  createResource,
  createSignal,
  onCleanup,
  onMount,
  Suspense,
  useTransition,
  type Component,
} from "solid-js";

import styles from "./App.module.css";

import * as i18n from "@solid-primitives/i18n";
import { fetchDictionary, Locale } from "./i18n/lang";
import { Switch } from "./components/switch";
import HomePage from "./pages/homePage";
import { PageContainer } from "./components/pageContainer";
import ReadingPage from "./pages/readingPage";
import { Article, getInfos } from "./articles/methods";
import ArticlePage from "./pages/articlePage";
import NotFoundPage from "./pages/notFoundPage";

export enum Pages {
  NotFound = 0,
  Home = 1,
  Reading = 2,
  Article = 3,
}

const App: Component = () => {
  const [locale, setLocale] = createSignal<Locale>("zh");

  const [dict] = createResource(locale, fetchDictionary);

  const t = i18n.translator(dict);

  const [duringTransition, startTransition] = useTransition();

  function switchLocale(locale: Locale) {
    startTransition(() => setLocale(locale));
  }

  let header: HTMLElement;
  let longWidth: number | null = null;
  const onResize = () => {
    if (window.innerWidth <= header.offsetWidth + 64) {
      if (
        header.firstChild &&
        header.firstChild.textContent !== t("header.shortTitle")
      ) {
        longWidth = header.offsetWidth + 64;
        header.firstChild.textContent = t("header.shortTitle") || "";
        return;
      }
      if (header.style.top === "-10rem") return;
      header.style.top = "-10rem";
    } else {
      if (
        window.innerWidth > (longWidth ?? header.offsetWidth + 64) &&
        header.firstChild
      ) {
        header.firstChild.textContent = t("header.title") || "";
      }
      if (window.innerWidth > header.offsetWidth + 64) {
        if (header.style.top === "1rem") return;
        header.style.top = "1rem";
      }
    }
  };

  window.addEventListener("resize", onResize);

  let [defaultIndex, setDefaultIndex] = createSignal(1);
  let history: number[] = [1];
  let historyIndex = 0;
  let switchPage = (_target: number) => {
    console.warn("Not initialized");
  };

  const goBackward = () => {
    if (historyIndex >= 0) {
      historyIndex--;
      switchPage(history[historyIndex]);
    }
  };
  const goForward = () => {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      switchPage(history[historyIndex]);
    }
  };
  const handlePopState = (event: PopStateEvent) => {
    if (event.state > historyIndex) goForward();
    else if (event.state < historyIndex) goBackward();
  };

  const handleSwitch = (pageIndex: number, extra?: string) => {
    switchPage(pageIndex);
    if (historyIndex < history.length - 1) history.splice(historyIndex + 1);
    history.push(pageIndex);
    let url = `${Pages[pageIndex]}`;
    if (extra) url += `#${extra}`;
    window.history.pushState(pageIndex, "", url);
    historyIndex = history.length - 1;
  };

  let savePosition = () => {
    console.warn("Not initialized");
  };
  let loadPosition = () => {
    console.warn("Not initialized");
  };

  const [articleInfo, setArticleInfo] = createSignal<Article>();
  const loadArticle = (article: Article) => {
    setArticleInfo(article);
    handleSwitch(Pages.Article, article.fileName);
  };

  createEffect(() => {
    if (!duringTransition()) {
      onResize();
    }
  });

  let [isExistDarkModePlugin, setDarkModeCheckState] = createSignal(false);
  const checkDarkMode = () => {
    new Promise((resolve) => {
      setTimeout(() => {
        const cssChecker = document.getElementById("css-checker");
        if (cssChecker)
          setDarkModeCheckState(
            getComputedStyle(cssChecker).backgroundColor !==
              "rgb(255, 255, 255)"
          );
        resolve(null);
      }, 400);
    });
  };

  const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  darkModeMediaQuery.addEventListener("change", checkDarkMode);

  onMount(() => {
    checkDarkMode();

    header.style.top = "1rem";

    window.addEventListener("popstate", handlePopState);
    const path = window.location.pathname.substring(1);
    const param = window.location.hash.substring(1);
    if (path === "") return;
    const defaultIndex = Object.values(Pages).indexOf(path);
    if (!defaultIndex) return;
    setDefaultIndex(defaultIndex);
    if (param !== "" && path === Pages[3]) {
      new Promise(async () => {
        const fileName = param;
        const articles = await getInfos();
        const article = articles.find((a) => a.fileName === fileName);
        if (article) setArticleInfo(article);
      });
    }
  });

  onCleanup(() => {
    window.removeEventListener("resize", onResize);
    window.removeEventListener("popstate", handlePopState);
  });

  return (
    <div
      class={styles.App}
      style={{
        opacity: duringTransition() ? 0.5 : 1,
        display: "flex",
        "flex-direction": "column",
        height: "100%",
      }}
    >
      <header
        ref={(e) => {
          header = e;
        }}
        class={styles.header}
        style={{
          top: "-10rem",
        }}
      >
        <div
          style={{
            "margin-inline": "1.5rem",
            "padding-bottom": "0.125rem",
          }}
        >
          {t("header.title")}
        </div>
        <div
          style={{
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
            gap: "0.4rem",
          }}
        >
          <Switch current={1}>
            {[
              {
                label: "English",
                callback: () => switchLocale("en"),
              },
              { label: "中文", callback: () => switchLocale("zh") },
            ]}
          </Switch>
        </div>
      </header>
      <main
        style={{
          height: "100vh",
          width: "100vw",
        }}
      >
        <Suspense>
          <PageContainer
            defaultIndex={defaultIndex()}
            getMethods={(switchTo) => (switchPage = switchTo)}
            updateEvents={[
              {
                index: Pages.Home,
                enter: () => {
                  document.title = t("home.title") || "";
                },
              },
              {
                index: Pages.Reading,
                enter: () => {
                  loadPosition();
                  document.title = t("reading.title") || "";
                },
                leave: () => savePosition(),
              },
              {
                index: Pages.Article,
                enter: () => {
                  document.title = articleInfo()!.title;
                },
              },
            ]}
          >
            <NotFoundPage
              translator={t}
              operations={{ back: () => handleSwitch(Pages.Home) }}
            />
            <HomePage
              translator={t}
              operations={{ handleSwitch }}
              showDarkModeTip={isExistDarkModePlugin()}
            />
            <ReadingPage
              translator={t}
              operations={{ back: () => handleSwitch(Pages.Home), loadArticle }}
              getMethods={(save, load) => {
                savePosition = save;
                loadPosition = load;
              }}
            />
            <ArticlePage
              translator={t}
              info={articleInfo()}
              operations={{ back: () => handleSwitch(Pages.Reading) }}
            />
          </PageContainer>
        </Suspense>
      </main>
    </div>
  );
};

export default App;
