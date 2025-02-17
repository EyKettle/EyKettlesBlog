import { animateMini } from "motion";
import { Component, JSX, onMount, Show } from "solid-js";

type Effect = "none" | "float" | "3d" | "all";
const EFFECT_MAP = {
  valid: new Set<Effect>(["none", "float", "3d", "all"]),
  rotate: new Set<Effect>(["all", "3d"]),
  float: new Set<Effect>(["all", "float"]),
};

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
  let isTouch = false;

  let pressColor = "var(--surface-active)";
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
      if (EFFECT_MAP.rotate.has(props.effect ?? "none")) {
        element.style.transformOrigin = "center";
        element.style.transform = "";
      }
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
      props.effect =
        value && EFFECT_MAP.valid.has(value as Effect)
          ? (value as Effect)
          : "all";
    } else {
      if (!props.effect) props.effect = "float";
    }
    switch (props.effect) {
      case "all":
        element.style.touchAction = "none";
        break;
      case "3d":
        pressColor = "var(--surface-pressed)";
        break;
    }
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
      const offsetX = clientX - rect.left;
      const offsetY = clientY - rect.top;
      const halfWidth = rect.width / 2;
      const halfHeight = rect.height / 2;
      const rotateY =
        ((offsetX - halfWidth) / halfWidth) *
        rotateDelta *
        (props.effect === "all" ? 1.5 : 1);
      const rotateX =
        ((offsetY - halfHeight) / halfHeight) *
        rotateDelta *
        -1 *
        (props.effect === "all" ? 1.5 : 1);
      element.style.transform = `perspective(64rem) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
      isFrameScheduled = false;
    });
  };

  onMount(() => {
    if (!element) return;
    remValue = parseFloat(getComputedStyle(document.documentElement).fontSize);
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
        transition: "all 0.15s cubic-bezier(0.2, 0, 0, 1)",
        "will-change":
          "transform, box-shadow, z-index, background-color, scale",
        cursor: props.disabled ? "unset" : "pointer",
        "user-select": "none",
        ...props.extraStyle,
      }}
      on:mouseenter={() => {
        if (props.disabled || isTouch || !element) return;
        if (props.effect && EFFECT_MAP.float.has(props.effect))
          element.style.scale = "1.1";
        element.style.boxShadow =
          "0 0.5rem 1rem var(--shadow-color), 0 0 0 0.0625rem var(--border-active)";
        element.style.zIndex = "2";
        element.style.backgroundColor = "var(--surface-hover)";
      }}
      on:mouseleave={() => {
        if (!props.disabled && !isTouch) resetStyle();
      }}
      on:mousedown={(e) => {
        if (props.disabled || isTouch || !element) return;
        if (e.button === 0) {
          element.style.backgroundColor = pressColor;
          if (props.effect && props.effect !== "none") {
            if (EFFECT_MAP.rotate.has(props.effect)) {
              handleRotate(element, e.clientX, e.clientY);
              if (props.effect === "3d") element.style.scale = "0.95";
            }
            if (EFFECT_MAP.float.has(props.effect))
              element.style.scale = "1.05";
          }
        }
      }}
      on:mouseup={(e) => {
        if (isTouch) {
          isTouch = false;
          return;
        }
        if (props.disabled || !element) return;
        if (e.button === 0) {
          element.style.backgroundColor = "var(--surface-hover)";
          if (props.effect && props.effect !== "none") {
            if (EFFECT_MAP.rotate.has(props.effect)) {
              element.style.transform = "";
              if (props.effect === "3d") element.style.scale = "1";
            }
            if (EFFECT_MAP.float.has(props.effect)) element.style.scale = "1.1";
          }
        }
      }}
      on:mousemove={(e) => {
        if (props.disabled || isTouch || !element) return;
        if (e.buttons === 1) {
          if (props.effect === "all")
            handleRotate(element, e.clientX, e.clientY);
        }
      }}
      on:touchstart={(e) => {
        isTouch = true;
        if (props.disabled || !element) return;
        if (props.effect !== "3d")
          element.style.boxShadow =
            "0 0.5rem 1rem var(--shadow-color), 0 0 0 0.0625rem var(--border-active)";
        if (props.effect) {
          if (props.effect === 'none') {
            element.style.backgroundColor = "var(--surface-hover)";
            return;
          }
          if (EFFECT_MAP.rotate.has(props.effect)) {
            handleRotate(element, e.touches[0].clientX, e.touches[0].clientY);
            if (props.effect === "3d") {
              element.style.backgroundColor = pressColor;
              element.style.scale = "0.95";
            }
          }
          if (EFFECT_MAP.float.has(props.effect)) {
            element.style.backgroundColor = "var(--surface-hover)";
            element.style.scale = "1.05";
          }
        }
      }}
      on:touchmove={(e) => {
        if (!props.disabled && element && props.effect === "all") {
          const rect = element.getBoundingClientRect();
          if (
            e.touches[0].clientX >= rect.left - 3 * remValue &&
            e.touches[0].clientX <= rect.right + 3 * remValue &&
            e.touches[0].clientY >= rect.top - 3 * remValue &&
            e.touches[0].clientY <= rect.bottom + 3 * remValue
          ) {
            element.style.backgroundColor = "var(--surface-hover)";
            element.style.boxShadow =
              "0 0.5rem 1rem var(--shadow-color), 0 0 0 0.0625rem var(--border-active)";
            element.style.scale = "1.05";
            handleRotate(element, e.touches[0].clientX, e.touches[0].clientY);
          } else resetStyle();
        }
      }}
      on:touchend={() => {
        if (!props.disabled) {
          resetStyle();
        }
      }}
      on:blur={() => {
        if (!props.disabled) resetStyle();
      }}
      on:click={() => {
        if (!props.disabled && !isTouch && props.onClick) {
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
