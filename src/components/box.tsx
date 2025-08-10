import { Component, createSignal, JSX, onMount } from "solid-js";
import { dynamicSquircle } from "../utils";

interface Props {
  ref?: (el: HTMLDivElement) => void;
  class?: string;
  style?: JSX.CSSProperties;
  children?: any;
}
const Box: Component<Props> = (p) => {
  let el: HTMLDivElement;

  const [path, setPath] = createSignal("");
  const observer = new ResizeObserver((e) => dynamicSquircle(e, setPath));
  onMount(() => {
    observer.observe(el);
  });

  return (
    <div
      ref={(e) => {
        el = e;
        p.ref?.(e);
      }}
      class={p.class}
      style={{
        "clip-path": `path('${path()}')`,
        "border-radius": "var(--radius-regular)",
        padding: "var(--padding-regular)",
        "background-color": "var(--color-back-primary)",
        ...p.style,
      }}
    >
      {p.children}
    </div>
  );
};

export default Box;
