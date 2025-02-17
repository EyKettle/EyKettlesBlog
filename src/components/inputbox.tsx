import { Component, JSX, onMount } from "solid-js";

interface InputBoxProps {
  placeholder?: string;
  value?: string;
  multiline?: boolean;
  extraStyle?: JSX.CSSProperties;
}

const InputBox: Component<InputBoxProps> = (props) => {
  let element: HTMLDivElement | null = null;

  return (
    <input
      ref={(e) => (element = e)}
      type="text"
      style={{
        border: "none",
        outline: "none",
        "font-size": "1rem",
        "text-align": "start",
        color: "var(--theme-text)",
        "background-color": "var(--input-default)",
        "border-radius": "0.5rem",
        "box-shadow": "0 0 0 0.0625rem var(--border-default)",
        padding: "0.5rem",
        transition: "all 0.2s cubic-bezier(0, 0, 0, 1)",
        cursor: "text",
        ...props.extraStyle,
      }}
      placeholder={props.placeholder || ""}
      value={props.value || ""}
      on:mouseenter={() => {
        if (!element || element === document.activeElement) return;
        element.style.boxShadow = "0 0 0 0.0625rem var(--theme-accent)";
      }}
      on:mouseleave={() => {
        if (!element || element === document.activeElement) return;
        element.style.boxShadow = "0 0 0 0.0625rem var(--border-default)";
      }}
      on:focus={() => {
        if (!element) return;
        element.style.zIndex = "3";
        element.style.boxShadow =
          "0 0 0 0.1875rem var(--theme-accent), 0 0.125rem 1rem var(--border-down)";
      }}
      on:blur={() => {
        if (!element) return;
        element.style.zIndex = "unset";
        element.style.boxShadow = "0 0 0 0.0625rem var(--border-default)";
      }}
    />
  );
};

export default InputBox;
