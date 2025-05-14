import { JSX } from "solid-js";
import { animate, animateMini, AnimationOptions } from "motion";
import { VirtualizerHandle } from "virtua/solid";

export function separateValueAndUnit(
  cssValue: string
): { value: number; unit: string } | null {
  const match = cssValue.match(/^(\d+(\.\d*)?|\.\d+)([a-zA-Z%]+)?$/);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[3] || "";
    return { value, unit };
  }
  return null;
}

export const blocker = (height?: string, width?: string) => {
  const div = document.createElement("div");
  div.style.flexShrink = "0";
  if (height) div.style.height = height;
  if (width) div.style.width = width;
  return div;
};

export const buttonSize = (size: "large" | "medium" | "normal") => {
  let style: JSX.CSSProperties = {};
  switch (size) {
    case "large":
      style["font-size"] = "1.75rem";
      style["min-height"] = "3.5rem";
      style["min-width"] = "3.5rem";
      style.padding = "1rem 1.5rem";
      style["border-radius"] = "1.25rem";
      break;
    case "medium":
      style["font-size"] = "1.25rem";
      style["min-height"] = "3rem";
      style["min-width"] = "3rem";
      style.padding = "0.75rem 1rem";
      style["border-radius"] = "0.75rem";
      break;
  }
  return style;
};

export const roundButton = (size?: string) => {
  let style: JSX.CSSProperties = {
    height: size,
    width: size,
    "border-radius": "50%",
  };
  return style;
};

export const alignInfo = (
  alignOffset: number,
  vlist: VirtualizerHandle,
  pos: any,
  scrolling: boolean
) => {
  new Promise<void>((resolve) => {
    alignOffset !== undefined &&
      vlist !== undefined &&
      console.log(
        "目标点",
        pos.offsetY,
        "位移",
        vlist.scrollOffset,
        vlist.scrollSize,
        pos.offsetY + vlist.viewportSize,
        scrolling,
        "结果",
        alignOffset !== undefined &&
          vlist !== undefined &&
          vlist.scrollSize - (pos.offsetY + vlist.viewportSize) <=
            alignOffset &&
          !scrolling
      );
    setTimeout(() => {
      alignOffset !== undefined &&
        vlist !== undefined &&
        console.log(vlist.scrollSize);
      resolve();
    }, 20);
  });
};

export type reverseFn = (animationOption: AnimationOptions) => Promise<void>;

export const transition = (
  parent: HTMLElement,
  animatingElement: HTMLElement,
  startingState: {
    rect: DOMRect;
    style: TransitionStyle;
  },
  targetState: {
    rect: DOMRect;
    style: TransitionStyle;
  },
  animationOptions: {
    styleTransition: AnimationOptions;
    rectTransition: AnimationOptions;
  },
  denyPosition?: {
    x?: boolean;
    y?: boolean;
  }
): reverseFn => {
  const startingRect = startingState.rect;
  const targetRect = targetState.rect;
  const startStyle = startingState.style;
  const targetStyle = targetState.style;

  const parentRect = parent.getBoundingClientRect();
  const startX = startingRect.left - parentRect.left;
  const startY = startingRect.top - parentRect.top;

  animateMini(
    animatingElement,
    {
      background: targetStyle.background
        ? [startStyle.background!, targetStyle.background]
        : startStyle.background!,
      borderRadius: targetStyle.borderRadius
        ? [startStyle.borderRadius!, targetStyle.borderRadius]
        : startStyle.borderRadius!,
      boxShadow: targetStyle.boxShadow
        ? [startStyle.boxShadow!, targetStyle.boxShadow]
        : startStyle.boxShadow!,
    },
    animationOptions.styleTransition
  );
  animate(
    animatingElement,
    {
      height: [startingRect.height, targetRect.height],
      width: [startingRect.width, targetRect.width],
      x: denyPosition?.x
        ? 0
        : [startX, startX - (targetRect.width - startingRect.width) / 2],
      y: denyPosition?.y
        ? 0
        : [startY, startY - (targetRect.height - startingRect.height) / 2],
    },
    animationOptions.rectTransition
  );
  return (animationOption: AnimationOptions) =>
    new Promise<void>((resolve) => {
      animateMini(
        animatingElement,
        {
          background: targetStyle.background
            ? [targetStyle.background, startStyle.background!]
            : startStyle.background!,
          borderRadius: targetStyle.borderRadius
            ? [targetStyle.borderRadius, startStyle.borderRadius!]
            : startStyle.borderRadius!,
          boxShadow: targetStyle.boxShadow
            ? [targetStyle.boxShadow, startStyle.boxShadow!]
            : startStyle.boxShadow!,
        },
        animationOption
      );
      animate(
        animatingElement,
        {
          height: [targetRect.height, startingRect.height],
          width: [targetRect.width, startingRect.width],
          x: denyPosition?.x
            ? 0
            : [startX - (targetRect.width - startingRect.width) / 2, startX],
          y: denyPosition?.y
            ? 0
            : [startY - (targetRect.height - startingRect.height) / 2, startY],
        },
        animationOption
      ).then(resolve);
    });
};

export type TransitionStyle = {
  background?: string;
  borderRadius?: string;
  boxShadow?: string;
};

export const transitionPopup = (
  startingElement: HTMLElement,
  windowElement: HTMLElement,
  targetSize: {
    height: number;
    width: number;
  },
  targetStyle: TransitionStyle,
  denyPosition?: {
    x?: boolean;
    y?: boolean;
  },
  extraAnimation?: {
    start?: () => void;
    end?: () => void;
  }
):
  | {
      close: () => void;
    }
  | undefined => {
  const parent = startingElement.parentElement;
  if (!parent) return;
  startingElement.style.visibility = "hidden";
  windowElement.style.position = "absolute";
  const options: {
    styleTransition: AnimationOptions;
    rectTransition: AnimationOptions;
  } = {
    styleTransition: {
      ease: [0.5, 0, 0, 1],
      duration: 0.2,
    },
    rectTransition: {
      type: "spring",
      duration: 0.5,
      bounce: 0.4,
    },
  };
  const startingState = {
    rect: startingElement.getBoundingClientRect(),
    style: getComputedStyle(startingElement),
  };
  const state = windowElement.getBoundingClientRect();
  const targetState = {
    rect: new DOMRect(state.x, state.y, targetSize.width, targetSize.height),
    style: targetStyle,
  };
  parent.appendChild(windowElement);
  const reverse = transition(
    parent,
    windowElement,
    startingState,
    targetState,
    options,
    denyPosition
  );
  extraAnimation?.start?.();
  const close = () => {
    if (parent.contains(windowElement)) {
      reverse({
        duration: 0.2,
        ease: [0.5, 0, 0, 1],
      }).then(() => {
        parent.removeChild(windowElement);
        startingElement.style.visibility = "unset";
      });
      extraAnimation?.end?.();
    }
  };
  return { close };
};
