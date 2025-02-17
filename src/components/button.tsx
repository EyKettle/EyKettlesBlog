import { type Component, createSignal, For, onMount, Show } from "solid-js";

interface ButtonProps {
  icon?: string;
  iconColors?: string[];
  text?: string;
  type?: "button" | "ghost";
  rounded?: boolean;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  onClick?: () => void;
}

export const Button: Component<ButtonProps> = (props) => {
  let element: HTMLButtonElement | null = null;
  let isTouch = false;
  const iconChars = Array.from(props.icon || "");

  const [defaultStyle, setDefaultStyle] = createSignal({
    fontSize: "1.05rem",
  });

  onMount(() => {
    if (!element) {
      console.warn("Button element just disappeared?");
      return;
    }
    if (!props.type) props.type = "button";
    if (props.type === "button") {
      element.style.boxShadow = "0 0.0625rem 0 var(--border-down)";
      element.style.border = "0.0625rem solid var(--border-default)";
    } else {
      element.style.border = "none";
    }
    element.style.backgroundColor = `var(--${props.type}-default)`;

    if (props.rounded) element.style.borderRadius = "50%";
    if (props.size) {
      switch (props.size) {
        case "medium":
          element.style.minHeight = element.style.minWidth = "3rem";
          element.style.padding = "1rem";
          setDefaultStyle({ fontSize: "1.25rem" });
          if (!props.rounded) element.style.borderRadius = "0.75rem";
          break;
        case "large":
          element.style.minHeight = element.style.minWidth = "3.5rem";
          element.style.padding = "1.5rem";
          setDefaultStyle({ fontSize: "1.75rem" });
          if (!props.rounded) element.style.borderRadius = "1.25rem";
          break;
      }
    } else {
      element.style.padding = "0.75rem";
      if (!props.rounded) element.style.borderRadius = "0.5rem";
    }
  });

  return (
    <button
      ref={(e) => (element = e)}
      style={{
        display: "flex",
        "flex-shrink": 0,
        "flex-direction": "row",
        "justify-content": "center",
        "align-items": "center",
        "line-height": "0",
        outline: "none",
        "box-sizing": "border-box",
        color: "var(--theme-text)",
        "min-height": "2.5rem",
        "min-width": "2.5rem",
        "font-size": defaultStyle().fontSize,
        transition: "all 0.3s cubic-bezier(0, 0, 0, 1)",
        cursor: "pointer",
      }}
      on:mouseenter={(e) => {
        if (!props.disabled && !isTouch)
          e.currentTarget.style.backgroundColor = `var(--${props.type}-hover)`;
      }}
      on:mouseleave={(e) => {
        if (!props.disabled && !isTouch)
          e.currentTarget.style.backgroundColor = `var(--${props.type}-default)`;
      }}
      on:mousedown={(e) => {
        if (!props.disabled && !isTouch && e.button === 0)
          e.currentTarget.style.backgroundColor = `var(--${props.type}-active)`;
      }}
      on:mouseup={(e) => {
        if (isTouch) {
          isTouch = false;
          return;
        }
        if (!props.disabled && e.button === 0)
          e.currentTarget.style.backgroundColor = `var(--${props.type}-hover)`;
      }}
      on:touchstart={(e) => {
        isTouch = true;
        if (!props.disabled)
          e.currentTarget.style.backgroundColor = `var(--${props.type}-hover)`;
      }}
      on:touchend={(e) => {
        if (!props.disabled)
          e.currentTarget.style.backgroundColor = `var(--${props.type}-default)`;
      }}
      on:blur={(e) => {
        if (!props.disabled)
          e.currentTarget.style.backgroundColor = `var(--${props.type}-default)`;
      }}
      on:click={() => {
        if (!props.disabled && !isTouch) props.onClick?.();
      }}
    >
      <Show when={props.icon}>
        <div
          style={{
            display: "flex",
            "flex-direction": "column",
            "justify-content": "center",
            "align-items": "center",
            "font-family": "var(--icon-font)",
            "white-space": "nowrap",
            width: defaultStyle().fontSize,
            height: defaultStyle().fontSize,
          }}
        >
          <For each={iconChars}>
            {(char, index) => (
              <span
                style={{
                  // position: "absolute",
                  height: 0,
                  zoom: index() === 0 ? 0.95 : 1,
                  color: props.iconColors ? props.iconColors[index()] : "unset",
                }}
              >
                {char}
              </span>
            )}
          </For>
        </div>
      </Show>
      <Show when={props.text}>
        <div
          style={{
            "margin-inline": parseFloat(defaultStyle().fontSize) / 4 + "rem",
          }}
        >
          {props.text}
        </div>
      </Show>
    </button>
  );
};
