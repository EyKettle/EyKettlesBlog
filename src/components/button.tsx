import { Component, createSignal, JSX, onMount, Show } from "solid-js";
import { DOMElement } from "solid-js/jsx-runtime";
import { dynamicSquircle } from "../utils";
import Loading from "./loading";

export type ButtonOperator = {
  press: () => void;
  release: () => void;
  click: () => void;
};

export type ButtonSize = "regular" | "medium" | "large";
export type ButtonType = undefined | "ghost" | "diverse" | "stress" | "primary";

interface Props {
  style?: JSX.CSSProperties;
  label?: string;
  size?: ButtonSize;
  type?: ButtonType;
  disable?: boolean;
  color?: string;
  loading?: boolean;
  loadingColor?: string;
  onClick?: (
    event: MouseEvent & {
      currentTarget: HTMLButtonElement;
      target: DOMElement;
    }
  ) => void;
  ref?: (operator: ButtonOperator, element: HTMLButtonElement) => void;
}

const Button: Component<Props> = (p) => {
  let el: HTMLButtonElement;

  const [path, setPath] = createSignal("");
  const observer = new ResizeObserver((e) => dynamicSquircle(e, setPath));
  onMount(() => {
    observer.observe(el);
  });

  return (
    <button
      ref={(e) => {
        el = e;
        p.ref?.(
          {
            press: () => el.classList.add("press", "hover"),
            release: () => el.classList.remove("press", "hover"),
            click: () => {
              p.onClick?.({
                ...new MouseEvent("keyup"),
                currentTarget: el,
                target: el,
              });
            },
          },
          e
        );
      }}
      class={`button-${p.type ?? "default"}${p.disable ? " disable" : ""}`}
      style={{
        "clip-path": `path('${path()}')`,
        "border-radius": `${
          p.size === "large"
            ? "var(--radius-large)"
            : p.size === "medium"
            ? "var(--radius-medium)"
            : "var(--radius-regular)"
        }`,
        "font-size": `${
          p.size === "large"
            ? "var(--font-large)"
            : p.size === "medium"
            ? "var(--font-medium)"
            : "var(--font-regular)"
        }`,
        padding: `${
          p.size === "large"
            ? "var(--padding-large)"
            : p.size === "medium"
            ? "var(--padding-medium)"
            : "var(--padding-regular)"
        }`,
        "pointer-events": `${p.disable ? "none" : "unset"}`,
        ...p.style,
      }}
      disabled={p.disable}
      onClick={p.onClick}
      onMouseEnter={() => el.classList.add("hover")}
      onMouseLeave={() => el.classList.remove("press", "hover")}
      onMouseDown={() => el.classList.add("press")}
      onMouseUp={() => el.classList.remove("press")}
      onTouchStart={() => el.classList.add("hover", "press")}
      onTouchEnd={() => el.classList.remove("hover", "press")}
      onFocus={() => el.classList.add("hover")}
      onBlur={() => el.classList.remove("press", "hover")}
      onKeyDown={(e) => {
        if (e.key === "Enter") el.classList.add("press");
      }}
      onKeyUp={(e) => {
        if (e.key === "Enter") el.classList.remove("press");
      }}
    >
      <span
        style={{
          display: "block",
          scale: `${p.loading ? "0.2" : ""}`,
          opacity: `${p.loading ? "0" : ""}`,
          transition: "var(--transition-short)",
          "font-size": `${
            p.size === "large"
              ? "var(--font-large)"
              : p.size === "medium"
              ? "var(--font-medium)"
              : "var(--font-regular)"
          }`,
          color: `${p.color}`,
        }}
      >
        {p.label}
      </span>
      <Show when={p.loading}>
        <Loading
          color={
            p.loadingColor
              ? p.loadingColor
              : p.type === "primary"
              ? "var(--onPrimary)"
              : p.type === "stress"
              ? "var(--onSecondary)"
              : undefined
          }
          style={{
            height: "1.25rem",
            width: "1.25rem",
            position: "absolute",
            inset: "0",
            "justify-self": "center",
            "align-self": "center",
          }}
        />
      </Show>
    </button>
  );
};
export default Button;
