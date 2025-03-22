import { Component, createEffect, JSX, onMount } from "solid-js";
import { VirtualizerHandle, VList } from "virtua/solid";
import { separateValueAndUnit } from "./utils";
import Blocker from "./blocker";
import { ScrollToIndexOpts } from "virtua";

export enum Sender {
  System,
  Own,
  Other,
}

export type ChatMessage = {
  sender: Sender;
  content: string;
};

enum BubblePosition {
  Start,
  Middle,
  End,
}

interface ChatMessageBubbleProps {
  children: ChatMessage;
  fontSize?: string;
  style?: JSX.CSSProperties;
  position: BubblePosition;
  getRef: (appearanceRef: HTMLDivElement, elementRef: HTMLDivElement) => void;
}

const ChatMessageBubble: Component<ChatMessageBubbleProps> = (props) => {
  let element: HTMLDivElement;
  let appearance: HTMLDivElement;
  onMount(() => {
    const fontSize = separateValueAndUnit(props.fontSize ?? "1rem") ?? {
      value: 1,
      unit: "rem",
    };
    appearance.style.borderRadius = 1 * fontSize.value + fontSize.unit;
    appearance.style.minHeight = 1.5 * fontSize.value + fontSize.unit;
    appearance.style.paddingBlock = 0.25 * fontSize.value + fontSize.unit;
    appearance.style.paddingInline = 0.75 * fontSize.value + fontSize.unit;
    if (props.position === BubblePosition.Start)
      appearance.style.marginTop = "0.25rem";

    element.style.justifyContent = "start";
    element.style.textAlign = "start";
    switch (props.children.sender) {
      case Sender.System:
        element.style.opacity = "0.6";
        appearance.style.backgroundColor = "transparent";
        appearance.style.border = "none";
        appearance.style.transformOrigin = "left";
        break;
      case Sender.Own:
        element.style.justifyContent = "end";
        element.style.textAlign = "end";
        appearance.style.backgroundColor = "var(--chat-own-back-default)";
        appearance.style.borderStyle = "solid";
        appearance.style.borderWidth = "0.0625rem";
        appearance.style.borderColor = "var(--border-default)";
        switch (props.position) {
          case BubblePosition.Start:
            appearance.style.borderBottomRightRadius = "0";
            appearance.style.transformOrigin = "bottom right";
            break;
          case BubblePosition.Middle:
            appearance.style.borderTopRightRadius = "0";
            appearance.style.borderBottomRightRadius = "0";
            appearance.style.transformOrigin = "right";
            break;
          case BubblePosition.End:
            appearance.style.borderTopRightRadius = "0";
            appearance.style.transformOrigin = "top right";
            break;
        }
        break;
      case Sender.Other:
        appearance.style.backgroundColor = "var(--chat-other-back-default)";
        appearance.style.borderStyle = "solid";
        appearance.style.borderWidth = "0.0625rem";
        appearance.style.borderColor = "var(--border-default)";
        switch (props.position) {
          case BubblePosition.Start:
            appearance.style.borderBottomLeftRadius = "0";
            appearance.style.transformOrigin = "bottom left";
            break;
          case BubblePosition.Middle:
            appearance.style.borderTopLeftRadius = "0";
            appearance.style.borderBottomLeftRadius = "0";
            appearance.style.transformOrigin = "left";
            break;
          case BubblePosition.End:
            appearance.style.borderTopLeftRadius = "0";
            appearance.style.transformOrigin = "top left";
            break;
        }
        break;
    }

    props.getRef(appearance, element);
  });
  return (
    <div
      ref={(e) => (element = e)}
      style={{
        display: "flex",
        padding: "0.125rem",
        "text-wrap": "wrap",
        "white-space": "break-spaces",
      }}
    >
      <div
        ref={(e) => (appearance = e)}
        style={{
          display: "flex",
          "justify-content": "center",
          "align-items": "center",
          "transition-property": "opacity, scale, filter",
          "transition-duration": "0.3s",
          "transition-timing-function": "cubic-bezier(0.5, 0, 0, 1)",
          "will-change": "scale, filter",
          ...props.style,
        }}
      >
        <div>
          <span
            style={{
              // //@ts-ignore
              // "text-box-trim": "trim-start",
              // "text-box-edge": "cap alphabetic",
              // "margin-top": "0.1875rem",
              "text-align": "start",
            }}
          >
            {props.children.content}
          </span>
        </div>
      </div>
    </div>
  );
};

interface ChatMessageBoxProps {
  children: ChatMessage[];
  fontSize?: string;
  style?: JSX.CSSProperties;
  paddingBottom?: string;
  getLastMsg?: (lastBubble: HTMLDivElement) => void;
  getMethods?: (
    scrollTo: (position: number) => void,
    scrollToBottom: () => void,
    getPosition: () => number,
    getIndex: () => number,
    scrollToIndex: (index: number, opts?: ScrollToIndexOpts) => void
  ) => void;
}

const ChatMessageBox: Component<ChatMessageBoxProps> = (props) => {
  let vlist: VirtualizerHandle | undefined;
  const scrollTo = (position: number) => {
    if (vlist) vlist.scrollTo(position);
  };
  const scrollToBottom = () => {
    if (vlist) vlist.scrollTo(vlist.scrollSize);
  };
  const getPosition = (): number => {
    return vlist ? vlist.scrollOffset : 0;
  };
  const getIndex = (): number => {
    return vlist ? vlist.findEndIndex() : 0;
  };
  const scrollToIndex = (index: number, opts?: ScrollToIndexOpts) => {
    if (vlist) vlist.scrollToIndex(index, opts);
  };
  if (props.getMethods)
    props.getMethods(
      scrollTo,
      scrollToBottom,
      getPosition,
      getIndex,
      scrollToIndex
    );

  let lastIndex = 0;
  createEffect(() => {
    if (props.children)
      setTimeout(() => {
        lastIndex = props.children.length - 1;
      }, 300);
  });
  return (
    <VList
      ref={(e) => (vlist = e)}
      data={props.children}
      style={{
        "font-size": `${props.fontSize ?? "1rem"}`,
        "user-select": "text",
        ...props.style,
      }}
    >
      {(item, i) => {
        let pos = BubblePosition.Start;
        if (i > 0 && item.sender === props.children[i - 1].sender) {
          if (
            i < props.children.length - 1 &&
            item.sender === props.children[i + 1].sender
          )
            pos = BubblePosition.Middle;
          else pos = BubblePosition.End;
        }
        return (
          <>
            <ChatMessageBubble
              getRef={(bubble) => {
                if (
                  bubble &&
                  i === props.children.length - 1 &&
                  lastIndex !== i
                ) {
                  if (props.getLastMsg) props.getLastMsg(bubble);
                  bubble.style.opacity = "0";
                  bubble.style.scale = "0.6";
                  bubble.style.filter = "blur(0.5rem)";
                  bubble.clientWidth;
                  bubble.style.opacity = "1";
                  bubble.style.scale = "1";
                  bubble.style.filter = "blur(0)";
                }
              }}
              position={pos}
              fontSize={props.fontSize}
            >
              {item}
            </ChatMessageBubble>
            {() => {
              if (i === props.children.length - 1 && props.paddingBottom) {
                return (
                  <Blocker
                    style={{
                      height: props.paddingBottom,
                    }}
                  />
                );
              }
            }}
          </>
        );
      }}
    </VList>
  );
};

export default ChatMessageBox;
