import { animateMini } from "motion";
import { Component, JSXElement, onCleanup, onMount } from "solid-js";
import { render } from "solid-js/web";

type PageInfo = {
  name: string;
  onPrepare?: () => void;
  onRouted?: (path: string, param?: string) => void;
  onLeave?: () => void;
};

interface PageContainerProps {
  children: JSXElement[];
  pageInfos: PageInfo[];
  defaultIndex: number;
  fakeRouter?: boolean;
  getMethods: (
    switchTo: (index: number, param?: string, replace?: boolean) => void
  ) => void;
}

export const PageContainer: Component<PageContainerProps> = (props) => {
  let container: HTMLDivElement;

  let frontIndex: number = props.defaultIndex;
  let pages: HTMLDivElement[] = [];

  const updateFrontPage = (target: number) => {
    if (pages.length > 0) {
      if (target < 0 || target >= pages.length) target = 0;
      if (container.children.length > 0) {
        if (target === frontIndex) return;
        const isForward = target > frontIndex;
        const newPage = container.appendChild(pages[target]);
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
          pages[frontIndex],
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
        const previous = frontIndex;
        frontIndex = target;

        new Promise((resolve) =>
          setTimeout(() => {
            if (frontIndex !== previous) {
              if (props.pageInfos[previous].onLeave)
                props.pageInfos[previous].onLeave();
              container.removeChild(pages[previous]);
            }
            resolve(null);
          }, 300)
        );
      } else {
        frontIndex = target;
        const newPage = container.appendChild(pages[target]);
        newPage.style.transform = "translateY(12rem)";
        newPage.style.opacity = "0";
        newPage.style.filter = "blur(1rem)";
        setTimeout(() => {
          animateMini(
            newPage,
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
          frontIndex = target;
        }, 200);
      }
      if (props.pageInfos[target].onPrepare)
        props.pageInfos[target].onPrepare!();
    }
  };

  let indexHistory: number[] = [];
  let historyPosition = 0;

  const handleSwitch = (index: number, param?: string, replace = false) => {
    updateFrontPage(index);
    if (props.fakeRouter) {
      if (historyPosition < indexHistory.length - 1)
        indexHistory.splice(historyPosition + 1);
      indexHistory.push(index);
      historyPosition = indexHistory.length - 1;
      let url = props.pageInfos[index].name;
      if (param) url += "#" + param;
      if (replace) {
        window.history.replaceState(historyPosition, "", "/" + url);
      } else {
        window.history.pushState(historyPosition, "", "/" + url);
      }
      if (props.pageInfos[index].onRouted)
        props.pageInfos[index].onRouted(props.pageInfos[index].name, param);
    }
  };
  props.getMethods(handleSwitch);

  const handleLocationChange = (first = false, replace?: boolean) => {
    if (!props.fakeRouter) {
      console.warn("LocationChange triggered without FakeRouter.");
      return;
    }
    const path = window.location.pathname.slice(1);
    const param = window.location.hash.slice(1);
    if (!first && path === "") return;
    const index = first
      ? props.defaultIndex
      : props.pageInfos.findIndex((page) => page.name === path);
    if (!index) return;
    // TODO: 思考如何解决刷新页面后被替换url的问题
    handleSwitch(index, param === "" ? undefined : param, replace);
  };

  const goBackward = () => {
    if (historyPosition > 0) {
      historyPosition--;
      updateFrontPage(indexHistory[historyPosition]);
    }
  };
  const goForward = () => {
    if (historyPosition < indexHistory.length - 1) {
      historyPosition++;
      updateFrontPage(indexHistory[historyPosition]);
    }
  };

  const handlePopState = (event: PopStateEvent) => {
    if (event.state === null) {
      handleLocationChange(true, true);
    } else {
      if (event.state > historyPosition) goForward();
      else if (event.state < historyPosition) goBackward();
    }
  };

  onMount(() => {
    pages = props.children.map((content) => {
      const page = document.createElement("div");
      page.style.position = "absolute";
      page.style.height = "100vh";
      page.style.width = "100vw";
      page.style.display = "flex";
      page.style.justifyContent = "center";
      render(() => content, page);
      return page;
    });

    window.addEventListener("popstate", handlePopState);
    if (props.fakeRouter) handleLocationChange(true, true);
    else handleSwitch(props.defaultIndex, undefined, true);
  });

  onCleanup(() => {
    window.removeEventListener("popstate", handlePopState);
  });

  return (
    <div
      ref={(e) => (container = e)}
      style={{
        height: "100%",
        width: "100%",
      }}
    ></div>
  );
};
