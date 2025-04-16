import {
  Component,
  createEffect,
  createRoot,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { Button } from "../components/button";
import ChatMessageBox, {
  ChatMessage,
  Sender,
} from "../components/chatMessageBox";
import { animate } from "motion";
import ChatInputBox from "../components/chatInputBox";
import { backButton } from "../controls/templates";
import { SolidMarkdown } from "solid-markdown";
import remarkGfm from "remark-gfm";

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
  let set: (index: number, content: any, snap?: boolean) => void;
  let open: (index: number) => void;
  let close: (index: number) => void;
  let getList: () => ReadonlyArray<ChatMessage>;

  const handleSubmit = (msg: string) => {
    append({
      sender: Sender.Own,
      content: msg,
    });
  };
  let scrollToBottom: () => void;
  let alignBottom: (sudden?: boolean) => void;

  const [showInput, setShowInput] = createSignal(true);

  const testStream = () =>
    new Promise<void>(async (resolve) => {
      const content = (await import("../articles/new.md?raw")).default;
      const [text, setText] = createSignal("");
      const markdown = createRoot((dispose) => ({
        element: (
          <SolidMarkdown
            // TODO: 改成消息专用的
            class="markdown-body"
            remarkPlugins={[remarkGfm]}
            children={text()}
            renderingStrategy="reconcile"
          ></SolidMarkdown>
        ),
        dispose,
      }));
      const targetIndex = append(
        {
          sender: Sender.Other,
          content: markdown.element,
        },
        true
      );
      for (let i = 0; i < content.length; i += 3)
        await new Promise<void>((resolve) =>
          setTimeout(() => {
            setText(content.substring(0, i));
            alignBottom(true);
            resolve();
          }, 80)
        );
      close(targetIndex);
      markdown.dispose();
      resolve();
    });
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
          snapOffset={64}
          getListOps={(a, r, s, o, c, l) => {
            append = a;
            remove = r;
            set = s;
            open = o;
            close = c;
            getList = l;
          }}
          getScrollOps={(t, b, p, s, e, i, a) => {
            scrollToBottom = b;
            alignBottom = a;
          }}
          showupMotion={(bubble) =>
            new Promise<void>((resolve) => {
              animate(
                bubble,
                {
                  opacity: [0, 1],
                  filter: ["blur(0.5rem)", "blur(0)"],
                },
                {
                  duration: 0.2,
                  ease: [0.5, 0, 0, 1],
                }
              );
              animate(
                bubble,
                {
                  scale: [0.6, 1],
                },
                {
                  type: "spring",
                  duration: 0.3,
                  bounce: 0.3,
                }
              ).then(resolve);
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
              iconStyle={[
                {
                  "font-size": "1.25rem",
                  rotate: "90deg",
                  translate: `2px ${showInput() ? "" : "-"}0.0625rem`,
                },
              ]}
              style={{
                width: "4rem",
              }}
              borderRadius="1.375rem"
              onClick={() => setShowInput(!showInput())}
            />
          )}
          showupMotion={(show, box, textArea) => {
            if (show) {
              box.style.height = "14rem";
              box.style.gap = "0.5rem";
              textArea.disabled = false;
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
              textArea.disabled = true;
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
