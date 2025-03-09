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
  style?: JSX.CSSProperties;
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
      if (!appearanceDiv) return;
      appearanceDiv.parentElement!.style.scale = "1";
      appearanceDiv.style.scale = "1";
      const shadowBox = appearanceDiv.parentElement!
        .firstChild! as HTMLDivElement;
      shadowBox.style.translate = "0 0.0625rem";
      shadowBox.style.filter = "blur(0.0625rem)";
      appearanceDiv.style.setProperty(
        "--squircle-outline-color",
        "var(--border-default)"
      );
      appearanceDiv.parentElement!.style.zIndex = "1";
      appearanceDiv.style.setProperty(
        "--squircle-fill",
        "var(--surface-light)"
      );
      if (EFFECT_MAP.rotate.has(props.effect ?? "none")) {
        appearanceDiv.style.transformOrigin = "center";
        appearanceDiv.style.transform = "";
      }
    });
  };

  let appearanceDiv: HTMLDivElement | null = null;
  onMount(() => {
    if (!appearanceDiv) {
      console.warn("Element not found");
      return;
    }

    const parent = appearanceDiv.parentElement!.parentElement;
    if (!parent) return;

    if (parent.hasAttribute("card-text-wrap")) {
      if (props.title && props.description)
        (appearanceDiv.children[1] as HTMLDivElement).style.whiteSpace =
          "normal";
      else if (props.description)
        (appearanceDiv.children[0] as HTMLDivElement).style.whiteSpace =
          "normal";
    }
    if (props.textAlign) appearanceDiv.style.alignItems = props.textAlign;
    else if (parent.hasAttribute("card-text-align")) {
      appearanceDiv.style.alignItems =
        parent.getAttribute("card-text-align") || "center";
    }
    if (props.textJustify)
      appearanceDiv.style.justifyContent = props.textJustify;
    else if (parent.hasAttribute("card-text-justify")) {
      appearanceDiv.style.justifyContent =
        parent.getAttribute("card-text-justify") || "center";
    }
    if (props.height) appearanceDiv.parentElement!.style.height = props.height;
    else if (parent.hasAttribute("card-height")) {
      appearanceDiv.parentElement!.style.height =
        parent.getAttribute("card-height") || "auto";
    }
    if (props.width) appearanceDiv.parentElement!.style.width = props.width;
    else if (parent.hasAttribute("card-width")) {
      appearanceDiv.parentElement!.style.width =
        parent.getAttribute("card-width") || "auto";
    }
    if (!props.effect) {
      if (parent.hasAttribute("card-effect")) {
        const value = parent.getAttribute("card-effect");
        props.effect =
          value && EFFECT_MAP.valid.has(value as Effect)
            ? (value as Effect)
            : "all";
      } else props.effect = "float";
    }
    switch (props.effect) {
      case "all":
        appearanceDiv.parentElement!.style.touchAction = "none";
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
      const shadowBox = element.parentElement!.firstChild! as HTMLDivElement;
      // const scaleX =
    });
  };

  onMount(() => {
    if (!appearanceDiv) return;
    remValue = parseFloat(getComputedStyle(document.documentElement).fontSize);
  });

  return (
    <div
      style={{
        display: "flex",
        "flex-shrink": "0",
        "z-index": "1",
        height: "fit-content",
        width: "fit-content",
        "border-radius": "1rem",
        transition: "scale 0.15s cubic-bezier(0.2, 0, 0, 1)",
        "will-change": "scale",
        cursor: props.disabled ? "unset" : "pointer",
        "user-select": "none",
      }}
      on:mouseenter={() => {
        if (props.disabled || isTouch || !appearanceDiv) return;
        if (props.effect && EFFECT_MAP.float.has(props.effect)) {
          appearanceDiv.parentElement!.style.scale = "1.1";
          const shadowBox = appearanceDiv.parentElement!
            .firstChild! as HTMLDivElement;
          shadowBox.style.translate = "0 0.375rem";
          shadowBox.style.filter = "blur(0.25rem)";
        }
        appearanceDiv.style.setProperty(
          "--squircle-outline-color",
          "var(--border-active)"
        );
        appearanceDiv.parentElement!.style.zIndex = "2";
        appearanceDiv.style.setProperty(
          "--squircle-fill",
          "var(--surface-hover)"
        );
      }}
      on:mouseleave={() => {
        if (!props.disabled && !isTouch) resetStyle();
      }}
      on:mousedown={(e) => {
        if (props.disabled || isTouch || !appearanceDiv) return;
        if (e.button === 0) {
          appearanceDiv.style.setProperty("--squircle-fill", pressColor);
          if (props.effect && props.effect !== "none") {
            if (EFFECT_MAP.rotate.has(props.effect)) {
              handleRotate(appearanceDiv, e.clientX, e.clientY);
              if (props.effect === "3d") appearanceDiv.style.scale = "0.95";
            }
            if (EFFECT_MAP.float.has(props.effect)) {
              appearanceDiv.parentElement!.style.scale = "1.05";
            }
          }
        }
      }}
      on:mouseup={(e) => {
        if (isTouch) {
          isTouch = false;
          return;
        }
        if (props.disabled || !appearanceDiv) return;
        if (e.button === 0) {
          appearanceDiv.style.setProperty(
            "--squircle-fill",
            "var(--surface-hover)"
          );
          if (props.effect && props.effect !== "none") {
            if (EFFECT_MAP.rotate.has(props.effect)) {
              appearanceDiv.style.transform = "";
              if (props.effect === "3d") appearanceDiv.style.scale = "1";
            }
            if (EFFECT_MAP.float.has(props.effect)) {
              appearanceDiv.parentElement!.style.scale = "1.1";
              const shadowBox = appearanceDiv.parentElement!
                .firstChild! as HTMLDivElement;
              shadowBox.style.translate = "0 0.375rem";
              shadowBox.style.filter = "blur(0.25rem)";
            }
          }
        }
      }}
      on:mousemove={(e) => {
        if (props.disabled || isTouch || !appearanceDiv) return;
        if (e.buttons === 1) {
          if (props.effect === "all")
            handleRotate(appearanceDiv, e.clientX, e.clientY);
        }
      }}
      on:touchstart={(e) => {
        isTouch = true;
        if (props.disabled || !appearanceDiv) return;
        if (props.effect !== "3d") {
          appearanceDiv.style.setProperty(
            "--squircle-outline-color",
            "var(--border-active)"
          );
        }
        if (props.effect) {
          if (props.effect === "none") {
            appearanceDiv.style.setProperty(
              "--squircle-fill",
              "var(--surface-hover)"
            );
            return;
          }
          if (EFFECT_MAP.rotate.has(props.effect)) {
            handleRotate(
              appearanceDiv,
              e.touches[0].clientX,
              e.touches[0].clientY
            );
            if (props.effect === "3d") {
              appearanceDiv.style.setProperty("--squircle-fill", pressColor);
              appearanceDiv.style.scale = "0.95";
            }
          }
          if (EFFECT_MAP.float.has(props.effect)) {
            appearanceDiv.style.setProperty(
              "--squircle-fill",
              "var(--surface-hover)"
            );
            {
              appearanceDiv.parentElement!.style.scale = "1.05";
            }
          }
        }
      }}
      on:touchmove={(e) => {
        if (!props.disabled && appearanceDiv && props.effect === "all") {
          const rect = appearanceDiv.getBoundingClientRect();
          if (
            e.touches[0].clientX >= rect.left - 3 * remValue &&
            e.touches[0].clientX <= rect.right + 3 * remValue &&
            e.touches[0].clientY >= rect.top - 3 * remValue &&
            e.touches[0].clientY <= rect.bottom + 3 * remValue
          ) {
            appearanceDiv.style.setProperty(
              "--squircle-fill",
              "var(--surface-hover)"
            );
            appearanceDiv.style.setProperty(
              "--squircle-outline-color",
              "var(--border-active)"
            );
            appearanceDiv.parentElement!.style.scale = "1.05";
            handleRotate(
              appearanceDiv,
              e.touches[0].clientX,
              e.touches[0].clientY
            );
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
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "paint(squircle)",
          "--squircle-radius": "1rem",
          "--squircle-fill": "var(--shadow-color)",
          opacity: 0.6,
          translate: "0 0.0625rem",
          filter: "blur(0.0625rem)",
          transition: "all 0.15s cubic-bezier(0.2, 0, 0, 1)",
          "pointer-events": "none",
        }}
      />
      <div
        ref={(e) => (appearanceDiv = e)}
        style={{
          display: "flex",
          "flex-grow": 1,
          "flex-direction": "column",
          width: "100%",
          height: "100%",
          "box-sizing": "border-box",
          "justify-content": "center",
          "align-items": "center",
          "--squircle-radius": "1rem",
          background: "paint(squircle)",
          "--squircle-fill": "var(--surface-light)",
          "--squircle-outline-color": "var(--border-default)",
          "--squircle-outline": "0.0625rem",
          padding: "1rem",
          "transition-property": "all, --squircle-fill",
          "transition-duration": "0.15s",
          "transition-timing-function": "cubic-bezier(0.2, 0, 0, 1)",
          "will-change": "transform, box-shadow, z-index, --squircle-fill",
          ...props.style,
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
    </div>
  );
};
