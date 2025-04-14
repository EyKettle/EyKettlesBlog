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
import { fetchDictionary, Locale, locales } from "./i18n/lang";
import { animateMini } from "motion";

import { Switch } from "./components/switch";
import { PageContainer } from "./components/pageContainer";
import Loading from "./components/loading";

import HomePage from "./pages/homePage";
import ReadingPage from "./pages/readingPage";
import ArticlePage from "./pages/articlePage";
import NotFoundPage from "./pages/notFoundPage";
import ComponentsPage from "./pages/componentsPage";

import { Article, getInfos } from "./articles/methods";
import { Config, loadConfig, saveConfig } from "./localStorage";
import ChatPage from "./pages/chatPage";

export enum Pages {
  NotFound = 0,
  Home = 1,
  Reading = 2,
  Article = 3,
  ComponentLibrary = 4,
  Chat = 5,
}

const App: Component = () => {
  let config: Config = loadConfig();

  const [locale, setLocale] = createSignal<Locale>(config.language as Locale);

  const [dict] = createResource(locale, fetchDictionary);

  const t = i18n.translator(dict);

  const [duringTransition, startTransition] = useTransition();

  document.documentElement.lang = config.language;
  function switchLocale(locale: Locale) {
    config.language = locale;
    saveConfig(config);
    startTransition(() => {
      document.documentElement.lang = locale;
      setLocale(locale);
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
    } else {
      if (
        window.innerWidth > (longWidth ?? header.offsetWidth + 64) &&
        header.firstChild
      ) {
        header.firstChild.textContent = t("header.title") || "";
      }
    }
  };

  let switchTo: (_index: number, _param?: string) => void;
  let getFrontIndex: () => number;

  const updateTitle = (frontPage?: Pages) => {
    if (!dict()) return;
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
        document.title =
          articleInfo?.title || t("errors.unknownArticle") || "未知的文章";
        break;
      case Pages.ComponentLibrary:
        document.title = t("library.title") || "";
        break;
      default:
        break;
    }
  };
  createEffect(() => {
    dict();
    updateTitle();
  });

  let savePosition: () => void;
  let loadPosition: () => void;

  let saveChatPos: () => void;
  let loadChatPos: () => void;

  let saveArticlePos: () => void;
  let loadArticlePos: () => void;

  let articleInfo: Article | undefined = undefined;
  let setArticle: (_info?: Article) => void;
  const loadArticle = () => {
    if (!articleInfo) {
      console.warn("No article info");
      return;
    }
    config.currentArticle = articleInfo.fileName || "";
    setArticle(articleInfo);
  };

  createEffect(() => {
    if (!duringTransition()) {
      onResize();
    }
  });

  const cssChecker = document.getElementById("css-checker");
  let cssChecked = false;
  let [isExistDarkModePlugin, setDarkModeCheckState] = createSignal(false);
  const [isDark, setDark] = createSignal(false);
  const onDarkModeChanged = () => {
    setDark(darkModeMediaQuery.matches);
    if (darkModeMediaQuery.matches)
      document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  onMount(() => {
    window.addEventListener("resize", onResize);
    onDarkModeChanged();
    darkModeMediaQuery.addEventListener("change", onDarkModeChanged);
  });

  onCleanup(() => {
    window.removeEventListener("resize", onResize);
    darkModeMediaQuery.removeEventListener("change", onDarkModeChanged);
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
          top: "1rem",
        }}
      >
        <div
          style={{
            "z-index": 11,
            "margin-inline": "1.5rem",
            "padding-bottom": "0.125rem",
          }}
        >
          {t("header.title")}
        </div>
        <div
          style={{
            "z-index": 11,
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
            gap: "0.4rem",
          }}
        >
          <Switch
            default={locales.indexOf(locale())}
            backgroundColor="var(--color-surface-glass-dark)"
          >
            {[
              {
                label: "English",
                onClick: () => switchLocale("en-US"),
              },
              { label: "中文", onClick: () => switchLocale("zh-CN") },
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
        <Suspense fallback={<Loading />}>
          <PageContainer
            routeMode="fakeRouter"
            pageInfos={[
              {
                name: Pages[Pages.NotFound],
                onRouted: () => {
                  updateTitle(Pages.NotFound);
                  if (cssChecker)
                    setDarkModeCheckState(
                      getComputedStyle(cssChecker).backgroundColor !==
                        "rgb(255, 255, 255)"
                    );
                  cssChecked = true;
                },
              },
              {
                name: Pages[Pages.Home],
                onRouted: () => updateTitle(Pages.Home),
              },
              {
                name: Pages[Pages.Reading],
                onPrepare: () => loadPosition(),
                onRouted: () => updateTitle(Pages.Reading),
                onLeave: () => savePosition(),
              },
              {
                name: Pages[Pages.Article],
                onRouted: (_, param) =>
                  new Promise(async (resolve) => {
                    if (param)
                      await getInfos().then((articles) => {
                        articleInfo = articles.find(
                          (a) => a.fileName === param
                        );
                      });
                    else if (config.currentArticle)
                      await getInfos().then((articles) => {
                        articleInfo = articles.find(
                          (a) => a.fileName === config.currentArticle
                        );
                        window.location.hash = articleInfo?.fileName || "???";
                      });
                    loadArticle();
                    updateTitle(Pages.Article);
                    // new Promise((resolve) => {
                    //   if (!articleInfo)
                    //     getInfos().then((articles) => {
                    //       articleInfo = articles.find(
                    //         (a) => a.fileName === loadConfig().currentArticle
                    //       );
                    //     });
                    //   updateTitle(Pages.Article);
                    //   resolve(null);
                    // });
                    resolve(null);
                  }),
                onPrepare: () => loadArticlePos(),
                onLeave: () => saveArticlePos(),
              },
              {
                name: Pages[Pages.ComponentLibrary],
                onRouted: () => updateTitle(Pages.ComponentLibrary),
              },
              {
                name: Pages[Pages.Chat],
                onPrepare: () => loadChatPos(),
                onLeave: () => saveChatPos(),
              },
            ]}
            homeIndex={Pages.Home}
            defaultIndex={config.pageIndex}
            getMethods={(s, i) => {
              switchTo = (index: number, param?: string) => {
                config.pageIndex = index;
                saveConfig(config);
                s(index, param);
              };
              getFrontIndex = i;
            }}
            pageInit={(page) => {
              page.style.display = "grid";
              page.style.placeItems = "center";
              page.style.willChange = "opacity, scale, filter";
              page.style.overflow = "scroll";
            }}
            switchMotion={(oldPage, newPage, isForward) =>
              new Promise((resolve) => {
                newPage.style.scale = isForward ? "0.8" : "1.6";
                newPage.style.opacity = "0";
                newPage.style.filter = "blur(0.75rem)";
                animateMini(
                  newPage,
                  {
                    scale: 1,
                  },
                  {
                    duration: 0.3,
                    ease: [0.5, 0, 0, 1],
                  }
                ).then(resolve);
                animateMini(
                  newPage,
                  {
                    opacity: 1,
                    filter: "blur(0)",
                  },
                  {
                    duration: 0.15,
                    ease: [0.5, 0, 0.8, 1],
                  }
                );
                animateMini(
                  oldPage,
                  {
                    scale: isForward ? "1.6" : "0.8",
                  },
                  {
                    duration: 0.3,
                    ease: [0.5, 0, 0, 1],
                  }
                );
                animateMini(
                  oldPage,
                  {
                    opacity: 0,
                    filter: "blur(0.75rem)",
                  },
                  {
                    duration: 0.15,
                    ease: [0.5, 0, 0.8, 1],
                  }
                );
              })
            }
            loadedMotion={(container) => {
              container.style.transform = "translateY(12rem)";
              container.style.opacity = "0";
              container.style.filter = "blur(1rem)";
              new Promise<void>((resolve) => {
                setTimeout(() => {
                  animateMini(
                    container,
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
                  resolve();
                }, 200);
              });
            }}
            style={{
              "will-change": "opacity, transform, filter",
            }}
          >
            <NotFoundPage
              translator={t}
              operations={{ back: () => switchTo(Pages.Home) }}
            />
            <HomePage
              translator={t}
              operations={{ switchTo: (t) => switchTo(t) }}
              showDarkModeTip={isExistDarkModePlugin()}
            />
            <ReadingPage
              translator={t}
              operations={{
                back: () => switchTo(Pages.Home),
                setArticleInfo: (article) => {
                  articleInfo = article;
                  switchTo(Pages.Article, article.fileName);
                },
              }}
              getMethods={(save, load) => {
                savePosition = save;
                loadPosition = load;
              }}
            />
            <ArticlePage
              translator={t}
              defaultArticle={loadConfig().currentArticle}
              operations={{ back: () => switchTo(Pages.Reading) }}
              getMethods={(set, save, load) => {
                setArticle = set;
                saveArticlePos = save;
                loadArticlePos = load;
              }}
            />
            <ComponentsPage
              translator={t}
              operations={{
                back: () => switchTo(Pages.Home),
                enterChatPage: () => {
                  switchTo(Pages.Chat);
                },
              }}
              isDark={isDark()}
            />
            <ChatPage
              translator={t}
              operations={{ back: () => switchTo(Pages.ComponentLibrary) }}
              getMethods={(save, load) => {
                saveChatPos = save;
                loadChatPos = load;
              }}
            />
          </PageContainer>
        </Suspense>
      </main>
    </div>
  );
};

export default App;
