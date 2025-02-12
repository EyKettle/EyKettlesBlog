import { Component, JSX, onMount, Show } from "solid-js";

type Effect = "none" | "float" | "all";

interface CardProps {
  title?: string;
  description?: string;
  children?: any;
  effect?: Effect;
  textAlign?: string;
  textJustify?: string;
  height?: string;
  width?: string;
  extraStyle?: JSX.CSSProperties;
  disabled?: boolean;
  onClick?: () => boolean;
}

export const Card: Component<CardProps> = (props) => {
  const getTextStyle = (size: string) => {
    return {
      "font-size": `${size}rem`,
      "text-align": "start",
      "text-overflow": "ellipsis",
      "white-space": "nowrap",
      overflow: "hidden",
      width: "100%",
      "pointer-events": "none",
    } as JSX.CSSProperties;
  };

  const resetStyle = () => {
    requestAnimationFrame(() => {
      if (!element) return;
      element.style.scale = "1";
      element.style.boxShadow =
        "0 0.0625rem 0.125rem var(--shadow-color), 0 0 0 0.0625rem var(--border-default)";
      element.style.zIndex = "1";
      element.style.backgroundColor = "var(--surface-default)";
      if (props.effect === "all")
        element.style.transform = "rotateY(0deg) rotateX(0deg)";
    });
  };

  let element: HTMLDivElement | null = null;

  onMount(() => {
    if (!element) {
      console.warn("Element not found");
      return;
    }

    const parent = element.parentElement;
    if (!parent) return;

    if (parent.hasAttribute("card-text-wrap")) {
      if (props.title && props.description)
        (element.children[1] as HTMLDivElement).style.whiteSpace = "normal";
      else if (props.description)
        (element.children[0] as HTMLDivElement).style.whiteSpace = "normal";
    }
    if (parent.hasAttribute("card-text-align")) {
      element.style.alignItems =
        parent.getAttribute("card-text-align") || "center";
    } else if (props.textAlign) element.style.alignItems = props.textAlign;
    if (parent.hasAttribute("card-text-justify")) {
      element.style.justifyContent =
        parent.getAttribute("card-text-justify") || "center";
    } else if (props.textJustify)
      element.style.justifyContent = props.textJustify;
    if (parent.hasAttribute("card-height")) {
      element.style.height = parent.getAttribute("card-height") || "auto";
    } else if (props.height) element.style.height = props.height;
    if (parent.hasAttribute("card-width")) {
      element.style.width = parent.getAttribute("card-width") || "auto";
    } else if (props.width) element.style.width = props.width;
    if (parent.hasAttribute("card-effect")) {
      const value = parent.getAttribute("card-effect");
      props.effect = ["none", "float", "all"].includes(value ?? "")
        ? (value as Effect)
        : "all";
    } else {
      if (!props.effect) props.effect = "float";
    }
    if (props.effect === "all") parent.style.perspective = "64rem";
  });

  const rotateDelta = 10;
  let remValue: number;
  let isFrameScheduled = false;
  const handleRotate = (
    element: HTMLDivElement,
    clientX: number,
    clientY: number
  ) => {
    if (isFrameScheduled) return;
    isFrameScheduled = true;
    requestAnimationFrame(() => {
      const rect = element.getBoundingClientRect();
      if (
        clientX >= rect.left - 3 * remValue &&
        clientX <= rect.right + 3 * remValue &&
        clientY >= rect.top - 3 * remValue &&
        clientY <= rect.bottom + 3 * remValue
      ) {
        const { halfWidth, halfHeight } = {
          halfWidth: rect.width / 2,
          halfHeight: rect.height / 2,
        };
        const offsetX = clientX - rect.left;
        const offsetY = clientY - rect.top;
        const rotateY = ((offsetX - halfWidth) / halfWidth) * rotateDelta;
        const rotateX =
          ((offsetY - halfHeight) / halfHeight) * rotateDelta * -1;
        element.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
      } else resetStyle();
      isFrameScheduled = false;
    });
  };

  onMount(() => {
    if (!element) return;
    remValue =
      parseFloat(getComputedStyle(element).getPropertyValue("--rem")) || 16;
  });

  return (
    <div
      ref={(e) => {
        element = e;
      }}
      style={{
        display: "flex",
        "flex-shrink": "0",
        "z-index": "1",
        "flex-direction": "column",
        "justify-content": "center",
        "align-items": "center",
        "border-radius": "1.25rem",
        "background-color": "var(--surface-default)",
        "box-shadow":
          "0 0.0625rem 0.125rem var(--shadow-color), 0 0 0 0.0625rem var(--border-default)",
        padding: "1rem",
        transition: "all 0.2s cubic-bezier(0, 0, 0, 1)",
        "will-change":
          "transform, box-shadow, z-index, background-color, scale",
        cursor: props.disabled ? "unset" : "pointer",
        "user-select": "none",
        ...props.extraStyle,
      }}
      on:mouseenter={() => {
        if (props.disabled || !element) return;
        if (props.effect && ["float", "all"].includes(props.effect))
          element.style.scale = "1.1";
        element.style.boxShadow =
          "0 0.5rem 1rem var(--shadow-color), 0 0 0 0.0625rem var(--border-active)";
        element.style.zIndex = "2";
        element.style.backgroundColor = "var(--surface-hover)";
      }}
      on:mouseleave={() => {
        if (props.disabled) return;
        resetStyle();
      }}
      on:mousedown={(e) => {
        if (props.disabled || !element) return;
        if (e.button === 0) {
          element.style.backgroundColor = "var(--surface-active)";
          if (props.effect && ["float", "all"].includes(props.effect)) {
            element.style.scale = "1.05";
            if (props.effect === "all")
              handleRotate(element, e.clientX, e.clientY);
          }
        }
      }}
      on:mouseup={(e) => {
        if (props.disabled || !element) return;
        if (e.button === 0) {
          element.style.backgroundColor = "var(--surface-hover)";
          if (props.effect && ["float", "all"].includes(props.effect)) {
            element.style.scale = "1.1";
            if (props.effect === "all")
              element.style.transform = "rotateY(0deg) rotateX(0deg)";
          }
        }
      }}
      on:mousemove={(e) => {
        if (props.disabled || !element) return;
        if (e.buttons === 1) {
          if (props.effect === "all")
            handleRotate(element, e.clientX, e.clientY);
        }
      }}
      on:touchstart={() => {
        if (props.disabled || !element) return;
        element.style.backgroundColor = "var(--surface-active)";
        element.style.boxShadow =
          "0 0.5rem 1rem var(--shadow-color), 0 0 0 0.0625rem var(--border-active)";
        if (props.effect && ["float", "all"].includes(props.effect))
          element.style.scale = "1.05";
      }}
      on:touchmove={(e) => {
        if (
          props.disabled ||
          !element ||
          props.effect !== "all" ||
          element.style.scale === "1"
        )
          return;
        e.preventDefault();
        handleRotate(element, e.touches[0].clientX, e.touches[0].clientY);
      }}
      on:touchend={resetStyle}
      on:blur={resetStyle}
      on:click={() => {
        if (props.disabled) return;
        if (props.onClick) {
          if (props.onClick()) resetStyle();
        }
      }}
    >
      <Show when={props.title}>
        {" "}
        <div style={getTextStyle("1.5")}>{props.title}</div>
      </Show>
      <Show when={props.description}>
        <div style={getTextStyle("1.2")}>{props.description}</div>
      </Show>
      <Show when={typeof props.children !== "boolean"}>{props.children}</Show>
    </div>
  );
};
