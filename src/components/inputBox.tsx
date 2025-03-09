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
        background: "paint(squircle)",
        "--squircle-fill": "var(--input-default)",
        "--squircle-radius": "0.5rem",
        "--squircle-outline": "0.0625rem",
        "--squircle-outline-color": "var(--border-default)",
        padding: "0.625rem",
        "transition-property":
          "all, --squircle-fill, --squircle-outline, --squircle-outline-color",
        "transition-duration": "0.2s",
        "transition-timing-function": "cubic-bezier(0, 0, 0, 1)",
        cursor: "text",
        ...props.extraStyle,
      }}
      placeholder={props.placeholder || ""}
      value={props.value || ""}
      on:mouseenter={() => {
        if (!element || element === document.activeElement) return;
        element.style.setProperty(
          "--squircle-outline-color",
          "var(--theme-accent)"
        );
      }}
      on:mouseleave={() => {
        if (!element || element === document.activeElement) return;
        element.style.setProperty(
          "--squircle-outline-color",
          "var(--border-default)"
        );
      }}
      on:focus={() => {
        if (!element) return;
        element.style.zIndex = "3";
        element.style.setProperty("--squircle-outline", "0.125rem");
        element.style.setProperty(
          "--squircle-outline-color",
          "var(--theme-accent)"
        );
      }}
      on:blur={() => {
        if (!element) return;
        element.style.zIndex = "unset";
        element.style.setProperty("--squircle-outline", "0.0625rem");
        element.style.setProperty(
          "--squircle-outline-color",
          "var(--border-default)"
        );
      }}
    />
  );
};

export default InputBox;
