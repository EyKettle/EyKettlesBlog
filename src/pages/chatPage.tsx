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
        overflow: "scroll",
      }}
    >
      <Button
        icon={"\u{e10e}"}
        type="ghost"
        size="large"
        rounded={true}
        onClick={props.operations.back}
      />
      <div
        style={{
          display: "flex",
          "flex-grow": 1,
          "justify-content": "center",
          height: "100%",
          width: "100%",
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
          showed={true}
          placeHolder="键入消息"
          submitLabel="发送"
          fontSize="1.125rem"
          style={{
            position: "absolute",
            bottom: 0,
            height: "14rem",
            width: "calc(100% - 2rem)",
            "max-width": "40rem",
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
