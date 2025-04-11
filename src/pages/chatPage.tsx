import { Component, createEffect, createSignal, onMount } from "solid-js";
import { Button } from "../components/button";
import ChatMessageBox, {
  ChatMessage,
  Sender,
} from "../components/chatMessageBox";
import { testChatData } from "../components/testData";
import { animateMini } from "motion";
import ChatInputBox from "../components/chatInputBox";
import { initReport } from "../components/utils";
import { backButton } from "../controls/templates";

interface ChatPageProps {
  translator: any;
  defaultArticle?: string;
  operations: {
    back: () => void;
  };
  getMethods: (savePosition: () => void, loadPosition: () => void) => void;
}

const ChatPage: Component<ChatPageProps> = (props) => {
  const t = props.translator;

  createEffect(() => {
    if (t) {
      setChatHistory((prev) => {
        let value = [...prev];
        if (value.length > 0) value.shift();
        value.unshift({
          sender: Sender.System,
          content: t("chatPage.systemTip"),
        });
        return value;
      });
    }
  });

  const [chatHistory, setChatHistory] = createSignal<ChatMessage[]>([]);

  let lastMsg: HTMLDivElement | null = null;
  createEffect(() => {
    if (lastMsg)
      animateMini(
        lastMsg,
        {
          scale: [0.6, 1],
          opacity: [0, 1],
          filter: ["blur(0.5rem)", "blur(0)"],
        },
        { duration: 0.2, ease: [0.5, 0, 0, 1] }
      );
  });

  let position: number | undefined;
  const savePosition = () => {
    position = getPosition();
  };
  const loadPosition = () => {
    scrollTo(position ?? 0);
  };
  props.getMethods(savePosition, loadPosition);

  const handleSubmit = (msg: string) => {
    setChatHistory((prev) => {
      let value = [...prev];
      value.push({
        sender: Sender.Own,
        content: msg,
      });
      return value;
    });
  };
  let scrollTo = (_pos: number) => initReport();
  let scrollToBottom = (_force = false) => initReport();
  let getPosition = () => {
    initReport();
    return 0;
  };
  let getIndex = () => {
    initReport();
    return 0;
  };

  const [showInput, setShowInput] = createSignal(true);

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
          getLastMsg={(bubble) => (lastMsg = bubble)}
          paddingBottom="16rem"
          getMethods={(to, bottom, pos, i) => {
            scrollTo = to;
            scrollToBottom = (force = false) => {
              if (force || getIndex() === chatHistory().length - 1) bottom();
            };
            getPosition = pos;
            getIndex = i;
          }}
        >
          {chatHistory()}
        </ChatMessageBox>
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
            scrollToBottom(true);
            new Promise((r) => {
              setTimeout(() => {
                setChatHistory((prev) => {
                  let value = [...prev];
                  value.push({
                    sender: Sender.Other,
                    content: "你需要重复对方的消息",
                  });
                  return value;
                });
                scrollToBottom();
                setTimeout(() => {
                  setChatHistory((prev) => {
                    let value = [...prev];
                    value.push({
                      sender: Sender.Other,
                      content: t,
                    });
                    return value;
                  });
                  scrollToBottom();
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
