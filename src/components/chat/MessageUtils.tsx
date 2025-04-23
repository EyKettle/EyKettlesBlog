import { ChatMessage, Sender } from "./chatMessageBox";
import { SolidMarkdown } from "solid-markdown";
import remarkGfm from "remark-gfm";
import { createRoot, createSignal } from "solid-js";

export const createMarkdownMessage = (
  operations: {
    append: (info: ChatMessage, open?: boolean) => number;
    set: (index: number, content: any, align?: boolean) => void;
    close: (index: number) => void;
    alignBottom: (sudden?: boolean) => void;
  },
  sender: Sender
): {
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
  const targetIndex = operations.append(
    { sender, content: markdown.element },
    true
  );
  const push = (str: string) => {
    setRaw(raw() + str);
    operations.alignBottom(true);
  };
  const over = () => {
    operations.close(targetIndex);
    markdown.dispose();
  };
  return {
    push,
    over,
  };
};
