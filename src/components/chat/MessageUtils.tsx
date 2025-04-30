import { ChatMessage, Sender } from "./chatMessageBox";
import { SolidMarkdown } from "solid-markdown";
import remarkGfm from "remark-gfm";
import { createRoot, createSignal } from "solid-js";

export const createMarkdownMessage = (
  operations: {
    append: (info: ChatMessage, open?: boolean) => number;
  },
  sender: Sender,
  content: string
) => {
  const markdown = createRoot((dispose) => {
    dispose();
    return (
      <SolidMarkdown
        class="chat-markdown"
        remarkPlugins={[remarkGfm]}
        children={content}
        renderingStrategy="reconcile"
      ></SolidMarkdown>
    );
  });
  operations.append({ sender, content: markdown });
};

export const streamMarkdownMessage = (
  operations: {
    append: (info: ChatMessage, open?: boolean) => number;
    set: (index: number, content: any, align?: boolean) => void;
    close: (index: number) => void;
    alignCheck: () => boolean;
    scrollToBottom: (duration?: number) => void;
  },
  sender: Sender
): {
  start: () => void;
  push: (str: string) => void;
  over: () => void;
} => {
  const [raw, setRaw] = createSignal("");
  const markdown = createRoot((dispose) => ({
    element: (
      <SolidMarkdown
        class="chat-markdown"
        remarkPlugins={[remarkGfm]}
        children={raw()}
        renderingStrategy="reconcile"
      ></SolidMarkdown>
    ),
    dispose,
  }));
  let targetIndex: number | undefined;
  const start = () => {
    targetIndex = operations.append(
      { sender, content: markdown.element },
      true
    );
  };
  const push = (str: string) => {
    const willAlign = operations.alignCheck();
    setRaw(raw() + str);
    if (willAlign) operations.scrollToBottom(0);
  };
  const over = () => {
    if (targetIndex) operations.close(targetIndex);
    markdown.dispose();
  };
  return {
    start,
    push,
    over,
  };
};
