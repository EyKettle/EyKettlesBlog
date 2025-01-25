import { Component } from "solid-js";
import { Button } from "../components/button";

interface NotFoundPageProps {
  translator: any;
  operations: {
    back: () => void;
  };
}

const NotFoundPage: Component<NotFoundPageProps> = (props) => {
  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        "justify-content": "center",
        "align-items": "center",
        "padding-bottom": "8rem",
        gap: "2rem",
      }}
    >
      <Button
        icon={"\u{e10e}"}
        type="ghost"
        size="large"
        rounded={true}
        onClick={props.operations.back}
      />
      <h1 style={{ margin: "0 1rem", "font-size": "min(2rem, 6vw)" }}>
        {props.translator("errors.404")}
      </h1>
    </div>
  );
};

export default NotFoundPage;
