import { animateMini } from "motion";
import { Component, JSXElement, onMount } from "solid-js";
import { render } from "solid-js/web";

type UpdateEvent = {
  index: number;
  enter?: () => void;
  leave?: () => void;
};

interface PageContainerProps {
  children: JSXElement[];
  titles?: string[];
  defaultTitle?: string;
  updateEvents?: UpdateEvent[];
  defaultIndex: number;
  getMethods: (switchTo: (page: number) => void) => void;
}

export const PageContainer: Component<PageContainerProps> = (props) => {
  let container: HTMLDivElement;

  let frontIndex: number = props.defaultIndex;
  let pages: HTMLDivElement[] = [];

  const switchTo = (target: number) => {
    if (target < 0 || target >= pages.length) target = 0;
    if (pages.length > 0) {
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
            ease: [0, 0, 0, 1],
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
            ease: [0, 0, 0, 1],
          }
        );
        const previous = frontIndex;
        frontIndex = target;

        if (props.titles && props.titles[target].trim() !== "")
          document.title = props.titles[target];
        if (props.updateEvents) {
          props.updateEvents.forEach((event) => {
            if (event.index === target && event.enter) event.enter();
          });
        }

        setTimeout(() => {
          if (frontIndex !== previous) {
            if (props.updateEvents) {
              props.updateEvents.forEach((event) => {
                if (event.index === previous && event.leave) event.leave();
              });
            }
            container.removeChild(pages[previous]);
          }
        }, 300);
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
              ease: [0, 0, 0, 1],
            }
          );
          frontIndex = target;
        }, 200);
      }
    }
  };
  props.getMethods(switchTo);

  onMount(() => {
    if (props.titles && props.titles.length < props.children.length) {
      props.titles.push(
        ...Array(props.children.length - props.titles.length).fill(
          props.defaultTitle ?? ""
        )
      );
    }

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
    switchTo(props.defaultIndex);
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
