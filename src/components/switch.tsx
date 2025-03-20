import {
  Component,
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
} from "solid-js";

type SwitchItem = {
  label: string;
  onClick: () => void;
};

interface SwitchProps {
  disabled?: boolean;
  current?: number;
  children: SwitchItem[];
  backgroundColor?: string;
  onChange?: (index: number) => void;
}

interface SwitchItemProps {
  disabled?: boolean;
  index: number;
  text: string;
  active: boolean;
  callback: (index: number) => void;
  event: () => void;
  hooks: (reset: () => void) => void;
}

const SwitchItem: Component<SwitchItemProps> = (props) => {
  let element: HTMLButtonElement;

  const defaultStyle = {
    backgroundColor: "transparent",
  };

  const handleClick = () => {
    if (props.active) return;
    element.style.cursor = "auto";
    props.callback(props.index);
    props.event();
  };

  const reset = () => {
    element.style.color = "var(--theme-text)";
    element.style.backgroundColor = defaultStyle.backgroundColor;
    element.style.boxShadow = "none";
    element.style.translate = "0 0";
    element.style.borderTopWidth = "0";
    element.style.cursor = "pointer";
  };
  props.hooks(reset);

  const applyMousedown = () => {
    element.style.backgroundColor = "var(--switch-press)";
    element.style.boxShadow = "none";
    element.style.translate = "0 0";
    element.style.borderTopWidth = "0.0625rem";
  };
  const applyMouseup = () => {
    element.style.color = "var(--switch-onActive)";
    element.style.backgroundColor = "var(--switch-active)";
    element.style.boxShadow = "none";
    element.style.translate = "0 0";
    element.style.borderTopWidth = "0.0625rem";
  };

  const onEnterDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !props.disabled && !props.active && element) {
      e.preventDefault();
      element.style.scale = "0.95";
      applyMousedown();
    }
  };
  const onEnterUp = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !props.disabled && !props.active && element) {
      element.style.scale = "1";
      applyMouseup();
      handleClick();
    }
  };

  createEffect(() => {
    if (!element) return;
    if (props.disabled) element.tabIndex = -1;
    else if (props.active) element.tabIndex = -1;
    else element.tabIndex = 0;
  });

  onMount(() => {
    if (props.active) {
      element.style.color = "var(--switch-onActive)";
      element.style.backgroundColor = "var(--switch-active)";
      element.style.boxShadow = "none";
      element.style.translate = "0 0";
      element.style.borderTopWidth = "0.0625rem";
      element.style.cursor = "auto";
    } else {
      element.style.color = "var(--theme-text)";
      element.style.backgroundColor = defaultStyle.backgroundColor;
      element.style.boxShadow = "none";
      element.style.translate = "0 0";
      element.style.borderTopWidth = "0";
      element.style.cursor = "pointer";
    }

    if (!element) return;
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
        "align-items": "center",
        border: "none",
        padding: "0.5rem 1rem",
        "font-size": "1.05rem",
        "background-color": defaultStyle.backgroundColor,
        "border-radius": "0.5rem",
        "border-width": 0,
        "border-style": "solid",
        "border-top-width": "0",
        "border-color": "var(--border-down)",
        color: "var(--theme-text)",
        "transition-property": "background-color, scale",
        "transition-duration": "0.15s",
        "transition-timing-function": "cubic-bezier(0, 0, 0, 1)",
      }}
      on:click={handleClick}
      on:mouseenter={() => {
        if (props.active) return;
        element.style.backgroundColor = "var(--switch-hover)";
        element.style.boxShadow = "0 0.0625rem 0 var(--shadow-color)";
        element.style.translate = "0 -0.0625rem";
      }}
      on:mouseleave={() => {
        if (props.active) return;
        element.style.color = "var(--theme-text)";
        element.style.backgroundColor = defaultStyle.backgroundColor;
        element.style.boxShadow = "none";
        element.style.translate = "0 0";
        element.style.borderTopWidth = "0";
      }}
      on:mousedown={(e) => {
        if (e.button === 0) {
          if (props.active) return;
          applyMousedown();
        }
      }}
      on:mouseup={(e) => {
        if (e.button === 0) {
          if (props.active) return;
          applyMouseup();
        }
      }}
      on:touchstart={() => {
        if (props.active) return;
        element.style.backgroundColor = "var(--switch-hover)";
        element.style.boxShadow = "0 0.0625rem 0 var(--shadow-color)";
        element.style.translate = "0 -0.0625rem";
        element.style.borderTopWidth = "0";
      }}
      on:touchend={() => {
        if (props.active) return;
        element.style.color = "var(--theme-text)";
        element.style.backgroundColor = defaultStyle.backgroundColor;
        element.style.boxShadow = "none";
        element.style.translate = "0 0";
        element.style.borderTopWidth = "0";
      }}
      on:blur={() => {
        if (props.active) return;
        reset();
      }}
    >
      {props.text}
    </button>
  );
};

export const Switch: Component<SwitchProps> = (props) => {
  const [activeIndex, setActiveIndex] = createSignal(props.current ?? 0);
  const handleSwitch = (index: number) => {
    const prev = activeIndex();
    setActiveIndex(index);
    resetHandles[prev]();
    if (props.onChange) props.onChange(index);
  };
  let resetHandles: (() => void)[] = Array(props.children.length).fill(() =>
    console.warn("Switch item not found")
  );

  return (
    <div
      style={{
        display: "flex",
        "justify-content": "center",
        "min-height": "2.5rem",
        gap: "0.4rem",
        padding: "0.5rem",
        "background-color": `${
          props.backgroundColor ?? "var(--surface-light)"
        }`,
        "border-radius": "1rem",
        "border-style": "solid",
        "border-color": "var(--border-default)",
        "border-width": "0.0625rem",
        filter: "drop-shadow(0 0.0625rem 0 var(--auto-shadow))",
      }}
    >
      <For each={props.children}>
        {(item, index) => (
          <SwitchItem
            index={index()}
            text={item.label}
            callback={handleSwitch}
            event={item.onClick}
            active={index() === activeIndex()}
            hooks={(r) => {
              resetHandles[index()] = r;
            }}
            disabled={props.disabled}
          />
        )}
      </For>
    </div>
  );
};
