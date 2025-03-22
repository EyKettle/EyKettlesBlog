import { Component, createEffect, JSX, onMount } from "solid-js";
import { Button } from "./button";
import { initReport } from "./utils";

interface ChatInputBoxProps {
  showed: boolean;
  fontSize?: string;
  style?: JSX.CSSProperties;
  placeHolder?: string;
  submitLabel?: string;
  functionArea?: any;
  onSubmit?: (text: string) => boolean;
  bindKey?: {
    submit: string;
  };
}

const ChatInputBox: Component<ChatInputBoxProps> = (props) => {
  let element: HTMLDivElement;
  createEffect(() => {
    if (props.showed) element.style.translate = "0 0";
    else {
      const height = element.clientHeight;
      element.style.translate = "0 " + height + "px";
    }
  });

  const handleSubmit = () => {
    if (!props.onSubmit && !element.firstChild) return;
    const textArea = element.firstChild as HTMLTextAreaElement;
    if (textArea.value !== "") {
      if (props.onSubmit!(textArea.value)) textArea.value = "";
    }
  };

  let submitPress = () => initReport();
  let submitRelease = () => initReport();
  return (
    <div
      ref={(e) => (element = e)}
      style={{
        display: "flex",
        "flex-direction": "column",
        padding: "1rem",
        gap: "0.5rem",
        "box-sizing": "border-box",
        "border-radius": "1.5rem",
        "border-bottom-left-radius": "0",
        "border-bottom-right-radius": "0",
        "border-style": "solid",
        "border-width": "0.0625rem",
        "border-bottom-width": "0",
        "border-color": "var(--border-default)",
        "background-color": "var(--surface-hover)",
        "box-shadow": "0 0.25rem 0.5rem var(--shadow-color)",
        "transition-property": "translate",
        "transition-duration": "0.2s",
        "transition-timing-function": "cubic-bezier(0.5, 0, 0, 1)",
        ...props.style,
      }}
    >
      <textarea
        style={{
          "font-size": `${props.fontSize ?? "1rem"}`,
          border: "none",
          outline: "none",
          resize: "none",
          "flex-grow": 1,
          width: "100%",
          background: "none",
        }}
        placeholder={props.placeHolder}
        spellcheck={false}
        on:keydown={(e) => {
          if (e.ctrlKey && e.key === "Enter") submitPress();
        }}
        on:keyup={(e) => {
          if (e.ctrlKey && e.key === "Enter") {
            submitRelease();
            handleSubmit();
          }
        }}
      />
      <div
        style={{
          display: "grid",
          "grid-template-columns": "auto 6rem",
          height: "2.75rem",
          width: "100%",
        }}
      >
        <Button
          label={props.submitLabel}
          borderRadius="1.375rem"
          backgroundColor={{
            default: "var(--button-main-default)",
            hover: "var(--button-main-hover)",
            active: "var(--button-main-active)",
          }}
          style={{
            "grid-column-start": 2,
          }}
          onClick={handleSubmit}
          getAnimates={(p, r) => {
            submitPress = p;
            submitRelease = r;
          }}
        />
      </div>
    </div>
  );
};

export default ChatInputBox;
