import { Component, Show } from "solid-js";

interface LoadingProps {
  text?: string;
}

const Loading: Component<LoadingProps> = (props) => {
  return (
    <div
      style={{
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
        height: "100%",
        width: "100%",
      }}
    >
      Loading
      <Show when={props.text}>{props.text}</Show>
    </div>
  );
};

export default Loading;
