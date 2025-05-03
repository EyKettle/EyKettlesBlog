import { Component, createEffect, JSXElement } from "solid-js";
import prism from "prismjs";

interface CodeProps {
  children?: JSXElement;
  raw?: string;
  language: string;
}

const Code: Component<CodeProps> = (props) => {
  let code: HTMLElement;
  createEffect(() => {
    if (props.children) prism.highlightElement(code);
  });
  return (
    <code
      class={`language-${props.language}`}
      ref={(e) => (code = e)}
      innerHTML={
        props.raw &&
        prism.highlight(
          props.raw,
          prism.languages[props.language],
          props.language
        )
      }
    >
      {props.children}
    </code>
  );
};

export default Code;
