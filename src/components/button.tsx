import {
  type Component,
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

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

  const onEnterDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !props.disabled && element) {
      e.preventDefault();
      element.style.scale = "0.95";
    }
  };
  const onEnterUp = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !props.disabled && element) {
      element.style.scale = "1";
      props.onClick?.();
    }
  };

  createEffect(() => {
    if (!element) return;
    if (props.disabled) {
      element.tabIndex = -1;
    } else {
      element.tabIndex = 0;
    }
  });

  onMount(() => {
    if (!element) {
      console.warn("Button element just disappeared?");
      return;
    }
    if (!props.type) props.type = "button";
    if (props.type === "button") {
      element.style.borderStyle = "solid";
      element.style.borderWidth = "0";
      element.style.borderColor = "var(--border-up)";
      element.style.borderTopWidth = "0.0625rem";
      element.style.borderBottomColor = "var(--shadow-color)";
      element.style.borderBottomWidth = "0.0625rem";
    }
    element.style.backgroundColor = `var(--${props.type}-default)`;

    if (props.rounded) element.style.borderRadius = "50%";
    if (props.size) {
      switch (props.size) {
        case "medium":
          element.style.minHeight = element.style.minWidth = "3rem";
          element.style.padding = "1rem";
          setDefaultStyle({ fontSize: "1.25rem" });
          if (props.rounded) break;
          element.style.borderRadius = "0.75rem";
          break;
        case "large":
          element.style.minHeight = element.style.minWidth = "3.5rem";
          element.style.padding = "1.5rem";
          setDefaultStyle({ fontSize: "1.75rem" });
          if (props.rounded) break;
          element.style.borderRadius = "1.25rem";
          break;
      }
    } else {
      element.style.padding = "0.75rem";
      if (!props.rounded) {
        element.style.borderRadius = "0.5rem";
      }
    }

    element.addEventListener("keydown", onEnterDown);
    element.addEventListener("keyup", onEnterUp);
  });

  onCleanup(() => {
    if (!element) return;
    element.removeEventListener("keydown", onEnterDown);
    element.removeEventListener("keyup", onEnterUp);
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
        border: "none",
        color: "var(--theme-text)",
        "min-height": "2.5rem",
        "min-width": "2.5rem",
        "font-size": defaultStyle().fontSize,
        "transition-property": "background-color, scale",
        "transition-duration": "0.15s",
        "transition-timing-function": "cubic-bezier(0, 0, 0, 1)",
        "will-change": "scale",
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
