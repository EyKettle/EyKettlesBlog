import { Component, onMount } from "solid-js";
import prism from "prismjs";

interface CodeProps {
  children: string;
  class: string;
}

const Code: Component<CodeProps> = (props) => {
  let code: HTMLElement;
  onMount(() => {
    prism.highlightElement(code);
  });
  return (
    <code class={props.class} ref={(e) => (code = e)}>
      {props.children}
    </code>
  );
};

export default Code;
