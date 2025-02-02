import { Component, createSignal, For, onMount } from "solid-js";

type SwitchItem = {
  label: string;
  callback: () => void;
};

interface SwitchProps {
  current?: number;
  children: SwitchItem[];
  onChange?: (index: number) => void;
}

interface SwitchItemProps {
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

  onMount(() => {
    if (props.active) {
      element.style.color = "var(--switch-onActive)";
      element.style.backgroundColor = "var(--switch-active)";
      element.style.boxShadow = "inset 0 0.0625rem 0 var(--shadow-color)";
      element.style.cursor = "auto";
    } else {
      element.style.color = "var(--theme-text)";
      element.style.backgroundColor = defaultStyle.backgroundColor;
      element.style.boxShadow = "none";
      element.style.cursor = "pointer";
    }
  });

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
    element.style.cursor = "pointer";
  };
  props.hooks(reset);

  return (
    <button
      ref={(e) => (element = e)}
      style={{
        display: "flex",
        "align-items": "center",
        outline: "none",
        border: "none",
        "border-radius": "0.5rem",
        padding: "0.5rem 1rem",
        "font-size": "1.05rem",
        "background-color": defaultStyle.backgroundColor,
        color: "var(--theme-text)",
        transition: "all 0.2s cubic-bezier(0, 0, 0, 1)",
      }}
      on:click={handleClick}
      on:mouseenter={(e) => {
        if (props.active) return;
        element.style.backgroundColor = "var(--switch-hover)";
        element.style.boxShadow = "0 0.0625rem 0 var(--border-down)";
      }}
      on:mouseleave={(e) => {
        if (props.active) return;
        element.style.color = "var(--theme-text)";
        element.style.backgroundColor = defaultStyle.backgroundColor;
        element.style.boxShadow = "none";
      }}
      on:mousedown={(e) => {
        if (e.button === 0) {
          if (props.active) return;
          element.style.backgroundColor = "var(--switch-press)";
          element.style.boxShadow = "inset 0 0.0625rem 0 var(--border-down)";
        }
      }}
      on:mouseup={e => {
        if (e.button === 0) {
          if (props.active) return;
          element.style.color = "var(--switch-onActive)";
          element.style.backgroundColor = "var(--switch-active)";
          element.style.boxShadow = "inset 0 0.0625rem 0 var(--border-down)";
        }
      }}
      on:touchstart={() => {
        if (props.active) return;
        element.style.backgroundColor = "var(--switch-hover)";
        element.style.boxShadow = "0 0.0625rem 0 var(--border-down)";
      }}
      on:touchend={() => {
        if (props.active) return;
        element.style.color = "var(--theme-text)";
        element.style.backgroundColor = defaultStyle.backgroundColor;
        element.style.boxShadow = "none";
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
        "box-sizing": "border-box",
        "border-radius": "1rem",
        border: "0.0625rem solid var(--border-default)",
        "border-bottom": "0.0625rem solid var(--border-default-down)",
        padding: "0.5rem",
        overflow: "hidden",
        "background-color": "var(--surface-default)",
        "box-shadow": "0 0.0625rem 0.125rem var(--shadow-color)",
      }}
    >
      <For each={props.children}>
        {(item, index) => (
          <SwitchItem
            index={index()}
            text={item.label}
            callback={handleSwitch}
            event={item.callback}
            active={index() === activeIndex()}
            hooks={(r) => {
              resetHandles[index()] = r;
            }}
          />
        )}
      </For>
    </div>
  );
};
