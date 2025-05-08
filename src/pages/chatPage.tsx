import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { Button } from "../components/button";
import ChatMessageBox, {
  ChatMessage,
  Sender,
} from "../components/chat/chatMessageBox";
import ChatInputBox from "../components/chat/chatInputBox";
import { backButton } from "../controls/templates";
import { streamMarkdownMessage } from "../components/chat/MessageUtils";
import { animate, createSpring } from "animejs";

interface ChatPageProps {
  translator: any;
  defaultArticle?: string;
  operations: {
    back: () => void;
  };
}

const ChatPage: Component<ChatPageProps> = (props) => {
  const t = props.translator;

  createEffect(() => {
    if (t) set(0, t("chatPage.systemTip"));
  });

  let append: (info: ChatMessage, open?: boolean) => number;
  let remove: (index: number) => void;
  let set: (index: number, content: any, align?: boolean) => void;
  let open: (index: number) => void;
  let close: (index: number) => void;
  let getList: () => ReadonlyArray<ChatMessage>;

  const handleSubmit = (msg: string) => {
    append({
      sender: Sender.Own,
      content: msg,
    });
  };
  let scrollToBottom: (duration?: number) => void;
  let alignCheck: () => boolean;

  const [showInput, setShowInput] = createSignal(true);

  const testStream = async () => {
    const markdownMessage = streamMarkdownMessage(
      { append, set, close, alignCheck, scrollToBottom },
      Sender.Other
    );
    markdownMessage.start();
    const content = (await import("../articles/new.md?raw")).default;
    for (let i = 0; i < content.length; i += 3)
      await new Promise<void>((resolve) =>
        setTimeout(() => {
          markdownMessage.push(content.substring(i, i + 3));
          resolve();
        }, 80)
      );
    markdownMessage.over();
  };
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "S" && e.shiftKey) testStream();
  };

  onMount(() => {
    append({
      sender: Sender.System,
      content: t("chatPage.systemTip"),
    });

    document.addEventListener("keydown", handleKeydown);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeydown);
  });

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        "padding-top": "8.5rem",
        "padding-inline": "max(1.5rem, 3vw)",
        "align-items": "center",
        gap: "1rem",
        "box-sizing": "border-box",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {backButton(props.operations.back)}
      <div
        style={{
          display: "flex",
          "flex-grow": 1,
          "justify-content": "center",
          height: "100%",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <ChatMessageBox
          fontSize="1.125rem"
          paddingBottom="16rem"
          alignOffset={64}
          getListOps={(a, r, s, o, c, _, l) => {
            append = a;
            remove = r;
            set = s;
            open = o;
            close = c;
            getList = l;
          }}
          getScrollOps={(t, b, p, s, e, i, a) => {
            scrollToBottom = b;
            alignCheck = a;
          }}
          showupMotion={(bubble) =>
            new Promise<void>((resolve) => {
              animate(bubble, {
                opacity: [0, 1],
                filter: ["blur(0.5rem)", "blur(0rem)"],
                duration: 200,
              });
              animate(bubble, {
                scale: [0.6, 1],
                ease: createSpring({
                  stiffness: 400,
                  damping: 26,
                }),
                onComplete: () => resolve(),
              });
            })
          }
        />
        <ChatInputBox
          showed={showInput()}
          placeHolder={t("chatPage.placeholder")}
          submitLabel={t("chatPage.submit")}
          fontSize="1.125rem"
          style={{
            position: "absolute",
            bottom: 0,
            height: "14rem",
            width: "calc(100% - 2rem)",
            "max-width": "40rem",
          }}
          functionArea={() => (
            <Button
              icon={showInput() ? ">" : "<"}
              type="ghost"
              iconStyle={{
                "font-size": "1.25rem",
                rotate: "90deg",
                translate: `2px ${showInput() ? "" : "-"}0.0625rem`,
              }}
              style={{
                width: "4rem",
                "border-radius": "1.375rem",
              }}
              onClick={() => setShowInput(!showInput())}
            />
          )}
          showupMotion={(show, box, textArea) => {
            if (show) {
              box.style.height = "14rem";
              box.style.gap = "0.5rem";
              textArea.style.pointerEvents = "auto";
              textArea.style.height = "auto";
              (box.lastChild?.lastChild as HTMLDivElement).tabIndex = 0;
              (box.lastChild?.lastChild as HTMLDivElement).style.pointerEvents =
                "auto";
              (box.lastChild?.lastChild as HTMLDivElement).style.scale = "1";
              (box.lastChild?.lastChild as HTMLDivElement).style.opacity = "1";
            } else {
              box.style.height = "4.8125rem";
              box.style.gap = "0";
              textArea.style.pointerEvents = "none";
              textArea.style.height = "0";
              (box.lastChild?.lastChild as HTMLDivElement).tabIndex = -1;
              (box.lastChild?.lastChild as HTMLDivElement).style.pointerEvents =
                "none";
              (box.lastChild?.lastChild as HTMLDivElement).style.scale = "0.8";
              (box.lastChild?.lastChild as HTMLDivElement).style.opacity =
                "0.6";
            }
          }}
          onSubmit={(t) => {
            handleSubmit(t);
            scrollToBottom();
            new Promise((r) => {
              setTimeout(() => {
                append({
                  sender: Sender.Other,
                  content: "你需要重复对方的消息",
                });
                setTimeout(() => {
                  append({ sender: Sender.Other, content: t });
                }, t.length * 100);
                r(null);
              }, Math.random() * 1000 + 600);
            });
            return true;
          }}
        />
      </div>
    </div>
  );
};
export default ChatPage;
