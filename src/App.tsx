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

export enum Pages {
  NotFound = 0,
  Home = 1,
  Reading = 2,
  Article = 3,
  ComponentLibrary = 4,
}

const App: Component = () => {
  let config: Config = loadConfig();

  const [locale, setLocale] = createSignal<Locale>(config.language as Locale);

  const [dict] = createResource(locale, fetchDictionary);

  const t = i18n.translator(dict);

  const [duringTransition, startTransition] = useTransition();

  function switchLocale(locale: Locale) {
    config.language = locale;
    saveConfig(config);
    startTransition(() => {
      setLocale(locale);
      document.documentElement.lang = locale;
      updateTitle();
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

  const updateTitle = (frontPage?: Pages) =>
    new Promise((resolve) => {
      setTimeout(() => {
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
        resolve(null);
      }, 10);
    });
  let savePosition = () => {
    console.error("Not initialized");
  };
  let loadPosition = () => {
    console.error("Not initialized");
  };

  let articleInfo: Article | undefined = undefined;
  let setArticle = (_fileName?: string) => console.log("Not initialized");
  const loadArticle = () => {
    config.currentArticle = articleInfo?.fileName || "";
    setArticle(config.currentArticle);
  };

  createEffect(() => {
    if (!duringTransition()) {
      onResize();
    }
  });

  const cssChecker = document.getElementById("css-checker");
  let cssChecked = false;
  let [isExistDarkModePlugin, setDarkModeCheckState] = createSignal(false);
  const checkDarkMode = () => {
    if (darkModeMediaQuery.matches)
      document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
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
          <Switch current={locales.indexOf(locale())}>
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
        <Suspense fallback={<Loading />}>
          <PageContainer
            routeMode="fakeRouter"
            pageInfos={[
              {
                name: Pages[Pages.NotFound],
                onPrepare: () => updateTitle(Pages.NotFound),
                onRouted: () => {
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
                onRouted: async (_, param) => {
                  if (param)
                    await getInfos().then((articles) => {
                      articleInfo = articles.find((a) => a.fileName === param);
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
                },
              },
              {
                name: Pages[Pages.ComponentLibrary],
                onPrepare: () => updateTitle(Pages.ComponentLibrary),
              },
            ]}
            defaultIndex={config.pageIndex}
            getMethods={(s, i) => {
              switchTo = (index: number, param?: string) => {
                config.pageIndex = index;
                saveConfig(config);
                s(index, param);
              };
              getFrontIndex = i;
            }}
            switchMotion={(oldPage, newPage, isForward) => {
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
              );
              animateMini(
                newPage,
                {
                  opacity: 1,
                  filter: "blur(0)",
                },
                {
                  duration: 0.2,
                  ease: [0.2, 0, 1, 1],
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
                  duration: 0.2,
                  ease: [0.2, 0, 1, 1],
                }
              );
              return 300;
            }}
            loadedMotion={(defaultPage) => {
              defaultPage.style.transform = "translateY(12rem)";
              defaultPage.style.opacity = "0";
              defaultPage.style.filter = "blur(1rem)";
              new Promise((resolve) => {
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
                  resolve(null);
                }, 200);
              });
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
              getMethods={(set) => (setArticle = set)}
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
