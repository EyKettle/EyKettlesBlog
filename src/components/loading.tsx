import { animate, animateMini } from "motion";
import { Component, JSX, onMount, Show } from "solid-js";

interface LoadingProps {
  text?: string;
  extraStyle?: JSX.CSSProperties;
}

const Loading: Component<LoadingProps> = (props) => {
  let circle: SVGCircleElement;

  onMount(() => {
    if (circle) {
      animate(
        circle,
        {
          pathLength: [0.1, 0.4],
          pathOffset: [0.4, 0.1],
        },
        {
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: [0.2, 0, 0.8, 1],
        }
      );
      animateMini(
        circle,
        {
          rotate: ["0 0 1 0deg", "0 0 1 360deg"],
        },
        {
          duration: 1,
          repeat: Infinity,
          ease: [0.2, 0.1, 0.8, 0.9],
        }
      );
    }
  });

  return (
    <div
      style={{
        gap: "1rem",
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
        height: "100%",
        width: "100%",
        ...props.extraStyle,
      }}
    >
      <svg width="40" height="40" viewBox="0 0 100 100">
        <circle
          ref={(el) => (circle = el)}
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="var(--color-theme-accent)"
          stroke-width="12"
          stroke-linecap="round"
          style={{
            "transform-origin": "50% 50%",
          }}
        />
      </svg>
      <Show when={props.text}>
        <div style={{ "font-size": "1.5rem" }}>{props.text}</div>
      </Show>
    </div>
  );
};

export default Loading;
