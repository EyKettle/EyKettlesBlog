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
import { animateMini } from "motion";
import ComponentsPage from "./pages/componentsPage";

export enum Pages {
  NotFound = 0,
  Home = 1,
  Reading = 2,
  Article = 3,
  ComponentLibrary = 4,
}

const App: Component = () => {
  const [locale, setLocale] = createSignal<Locale>("zh-CN");

  const [dict] = createResource(locale, fetchDictionary);

  const t = i18n.translator(dict);

  const [duringTransition, startTransition] = useTransition();

  function switchLocale(locale: Locale) {
    startTransition(() => {
      setLocale(locale);
      document.documentElement.lang = locale;
      setTimeout(() => {
        updateTitle();
      }, 10);
    });
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

  let switchTo = (_index: number, _param?: string) =>
    console.error("Not initialized");
  let getFrontIndex = (): number => {
    throw new Error("Not initialized");
  };

  const updateTitle = (frontPage?: Pages) => {
    if (!frontPage) {
      frontPage = getFrontIndex() ?? Pages.Home;
    }
    switch (frontPage) {
      case Pages.NotFound:
        document.title = t("notFound.title") || "";
        break;
      case Pages.Home:
        document.title = t("home.title") || "电水壶使用手册";
        break;
      case Pages.Reading:
        document.title = t("reading.title") || "";
        break;
      case Pages.Article:
        document.title = articleInfo()?.title || "未知的文章";
        break;
      case Pages.ComponentLibrary:
        document.title = t("library.title") || "";
        break;
      default:
        break;
    }
  };

  let savePosition = () => {
    console.error("Not initialized");
  };
  let loadPosition = () => {
    console.error("Not initialized");
  };

  const [articleInfo, setArticleInfo] = createSignal<Article>();
  const loadArticle = (article: Article) => {
    setArticleInfo(article);
    switchTo(Pages.Article, article.fileName);
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
  onMount(() => {
    window.addEventListener("resize", onResize);
    checkDarkMode();
    darkModeMediaQuery.addEventListener("change", checkDarkMode);
    header.style.top = "1rem";
  });

  onCleanup(() => {
    window.removeEventListener("resize", onResize);
    darkModeMediaQuery.removeEventListener("change", checkDarkMode);
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
                callback: () => switchLocale("en-US"),
              },
              { label: "中文", callback: () => switchLocale("zh-CN") },
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
            pageInfos={[
              {
                name: Pages[Pages.NotFound],
                onPrepare: () => updateTitle(Pages.NotFound),
              },
              {
                name: Pages[Pages.Home],
                onPrepare: () => updateTitle(Pages.Home),
              },
              {
                name: Pages[Pages.Reading],
                onPrepare: () => {
                  loadPosition();
                  updateTitle(Pages.Reading);
                },
                onLeave: () => savePosition(),
              },
              {
                name: Pages[Pages.Article],
                onPrepare: () =>
                  new Promise((resolve) => {
                    setTimeout(() => {
                      updateTitle(Pages.Article);
                    }, 10);
                    resolve(null);
                  }),
              },
              {
                name: Pages[Pages.ComponentLibrary],
                onPrepare: () => updateTitle(Pages.ComponentLibrary),
              },
            ]}
            defaultIndex={Pages.Home}
            getMethods={(s, i) => {
              switchTo = s;
              getFrontIndex = i;
            }}
            switchMotion={(oldPage, newPage, isForward) => {
              newPage.style.scale = isForward ? "0.8" : "1.4";
              newPage.style.opacity = "0";
              newPage.style.filter = "blur(1rem)";
              animateMini(
                newPage,
                {
                  scale: 1,
                  opacity: 1,
                  filter: "blur(0)",
                },
                {
                  duration: 0.3,
                  ease: [0.5, 0, 0, 1],
                }
              );
              animateMini(
                oldPage,
                {
                  scale: isForward ? "1.4" : "0.8",
                  opacity: 0,
                  filter: "blur(1rem)",
                },
                {
                  duration: 0.3,
                  ease: [0.5, 0, 0, 1],
                }
              );
              return 300;
            }}
            loadedMotion={(defaultPage) => {
              defaultPage.style.transform = "translateY(12rem)";
              defaultPage.style.opacity = "0";
              defaultPage.style.filter = "blur(1rem)";
              setTimeout(() => {
                animateMini(
                  defaultPage,
                  {
                    transform: "translateY(0)",
                    opacity: 1,
                    filter: "blur(0)",
                  },
                  {
                    duration: 0.3,
                    ease: [0.5, 0, 0, 1],
                  }
                );
              }, 200);
            }}
          >
            <NotFoundPage
              translator={t}
              operations={{ back: () => switchTo(Pages.Home) }}
            />
            <HomePage
              translator={t}
              operations={{ switchTo }}
              showDarkModeTip={isExistDarkModePlugin()}
            />
            <ReadingPage
              translator={t}
              operations={{ back: () => switchTo(Pages.Home), loadArticle }}
              getMethods={(save, load) => {
                savePosition = save;
                loadPosition = load;
              }}
            />
            <ArticlePage
              translator={t}
              info={articleInfo()}
              operations={{ back: () => switchTo(Pages.Reading) }}
            />
            <ComponentsPage
              translator={t}
              operations={{ back: () => switchTo(Pages.Home) }}
            />
          </PageContainer>
        </Suspense>
      </main>
    </div>
  );
};

export default App;
