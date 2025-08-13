import { Component, JSX, Show } from "solid-js";

interface Props {
  text?: string;
  class?: string;
  style?: JSX.CSSProperties;
  color?: string;
}
const Loading: Component<Props> = (p) => {
  return (
    <div
      class={p.class}
      style={{
        gap: "1rem",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
        ...p.style,
      }}
    >
      <svg width="40" height="40" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={p.color ?? "var(--primary)"}
          stroke-width="12"
          stroke-linecap="round"
          style={{
            "transform-origin": "center",
            animation:
              "loadingRotate 1s cubic-bezier(0.2, 0.1, 0.8, 0.9) infinite, loadingPath 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate",
          }}
        />
      </svg>
      <Show when={p.text}>
        <div style={{ "font-size": "1.5rem" }}>{p.text}</div>
      </Show>
    </div>
  );
};
export default Loading;
