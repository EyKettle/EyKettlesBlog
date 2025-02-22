import { Component, JSX, JSXElement, onCleanup, onMount } from "solid-js";
import { insert } from "solid-js/web";

type PageInfo = {
  name: string;
  onPrepare?: () => void;
  onRouted?: (path: string, param?: string) => void;
  onLeave?: () => void;
};

interface PageContainerProps {
  children: JSXElement[];
  pageInfos: PageInfo[];
  extraStyle?: JSX.CSSProperties;
  pageInit?: (page: HTMLDivElement) => void;
  loadedMotion?: (defaultPage: HTMLDivElement) => void;
  switchMotion?: (
    oldPage: HTMLDivElement,
    newPage: HTMLDivElement,
    isForward: boolean
  ) => number;
  homeIndex?: number;
  defaultIndex: number;
  routeMode?: "none" | "spa" | "fakeRouter";
  getMethods: (
    switchTo: (index: number, param?: string, replace?: boolean) => void,
    getFrontIndex: () => number
  ) => void;
}

export const PageContainer: Component<PageContainerProps> = (props) => {
  let container: HTMLDivElement | null = null;

  let frontIndex: number = props.defaultIndex;
  let pages: HTMLDivElement[] = [];

  const updateFrontPage = (target: number) => {
    if (!container) return;
    if (pages.length > 0) {
      if (target < 0 || target >= pages.length) target = 0;
      if (container.children.length > 0) {
        if (target === frontIndex) return;
        const isForward = target > frontIndex;
        const newPage = container.appendChild(pages[target]);
        const previous = frontIndex;
        frontIndex = target;
        const removeOldPage = () => {
          if (frontIndex !== previous) {
            if (props.pageInfos[previous]?.onLeave)
              props.pageInfos[previous].onLeave();
            container?.removeChild(pages[previous]);
          }
        };
        if (props.switchMotion) {
          const duration = props.switchMotion(
            pages[previous],
            newPage,
            isForward
          );
          new Promise((resolve) =>
            setTimeout(() => {
              removeOldPage();
              resolve(null);
            }, duration)
          );
        } else removeOldPage();
      } else {
        frontIndex = target;
        const newPage = container.appendChild(pages[target]);
        if (props.loadedMotion) props.loadedMotion(newPage);
      }
      if (props.pageInfos[target]?.onPrepare)
        props.pageInfos[target].onPrepare!();
    }
  };

  let indexHistory: number[] = [];
  let historyPosition = 0;

  const handleSwitch = (
    index: number,
    param?: string,
    replace = false,
    first = false
  ) => {
    updateFrontPage(index);
    if (props.routeMode === "fakeRouter") {
      if (historyPosition < indexHistory.length - 1)
        indexHistory.splice(historyPosition + 1);
      indexHistory.push(index);
      historyPosition = indexHistory.length - 1;
      if (!first) {
        let url = props.pageInfos[index].name;
        if (param) url += "#" + param;
        if (replace) {
          window.history.replaceState(historyPosition, "", "/" + url);
        } else {
          window.history.pushState(historyPosition, "", "/" + url);
        }
      }
      if (props.pageInfos[index]?.onRouted)
        props.pageInfos[index].onRouted(props.pageInfos[index].name, param);
    }
  };

  const handleLocationChange = (first = false, replace?: boolean) => {
    if (props.routeMode !== "fakeRouter") {
      console.warn(container, "LocationChange triggered without FakeRouter.");
      return;
    }
    const path = window.location.pathname.slice(1);
    const param = window.location.hash.slice(1);
    if (!first && path === "") return;
    const index =
      path === "" && first
        ? props.defaultIndex
        : props.pageInfos.findIndex((page) => page.name === path);
    if (props.homeIndex && index !== props.homeIndex) first = false;
    if (index >= 0 && index < pages.length)
      handleSwitch(index, param === "" ? undefined : param, replace, first);
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

  const getFrontIndex = () => frontIndex;
  props.getMethods(handleSwitch, getFrontIndex);

  onMount(() => {
    pages = props.children.map((content) => {
      const page = document.createElement("div");
      if (props.pageInit) props.pageInit(page);
      else {
        page.style.position = "absolute";
        page.style.height = "100vh";
        page.style.width = "100vw";
        page.style.display = "flex";
        page.style.justifyContent = "center";
      }
      insert(page, content);
      return page;
    });

    if (props.pageInfos.length !== pages.length)
      throw new Error("PageInfos length not matched.");

    if (props.routeMode !== "none")
      window.addEventListener("popstate", handlePopState);

    if (props.routeMode === "fakeRouter") handleLocationChange(true, true);
    else {
      handleSwitch(props.defaultIndex, undefined, true);
      if (
        props.routeMode !== "none" &&
        window.location.pathname.slice(1) !== ""
      )
        window.history.replaceState(null, "", "/");
    }
  });

  onCleanup(() => {
    if (props.routeMode !== "none")
      window.removeEventListener("popstate", handlePopState);
  });

  return (
    <div
      ref={(e) => (container = e)}
      style={{
        height: "100%",
        width: "100%",
        ...props.extraStyle,
      }}
    ></div>
  );
};
