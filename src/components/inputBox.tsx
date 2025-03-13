import { Component, JSX } from "solid-js";

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
        "font-size": "1.125rem",
        "text-align": "start",
        color: "var(--theme-text)",
        "border-radius": "0.5rem",
        "background-color": "var(--input-default)",
        "box-shadow": "0 0 0 0.0625rem var(--border-default)",
        padding: "0.625rem",
        "transition-property": "background-color, box-shadow",
        "transition-duration": "0.2s",
        "transition-timing-function": "cubic-bezier(0, 0, 0, 1)",
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
        element.style.boxShadow = "0 0 0 0.125rem var(--theme-accent)";
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
