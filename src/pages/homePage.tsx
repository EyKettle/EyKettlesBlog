import { Component, Show } from "solid-js";
import { Card } from "../components/card";
import { Pages } from "../App";
import { Button } from "../components/button";

interface HomePageProps {
  translator: any;
  showDarkModeTip: boolean;
  operations: {
    switchTo: (target: number) => void;
  };
}

const HomePage: Component<HomePageProps> = (props) => {
  const t = props.translator;

  const handleCard2 = () => {
    props.operations.switchTo(Pages.Reading);
    return true;
  };

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        "justify-content": "center",
        "align-items": "center",
        gap: "1rem",
        "padding-top": "2rem",
        "padding-bottom": "6rem",
        overflow: "scroll",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          "flex-direction": "row",
          gap: "1rem",
        }}
        card-text-justify="flex-end"
        card-text-align="flex-start"
        card-height="clamp(10rem, 40vw, 18rem)"
        card-width="min(42vw, 22rem)"
        card-effect=""
      >
        <Card
          title={t("home.card1.title")}
          description={t("home.card1.description")}
        />
        <Card
          title={t("home.card2.title")}
          description={t("home.card2.description")}
          onClick={handleCard2}
        />
      </div>
      <Button
        icon={"\ue0ab"}
        label={t("home.enterLibrary")}
        type="ghost"
        size="medium"
        onClick={() => props.operations.switchTo(Pages.ComponentLibrary)}
      />
      <Show when={props.showDarkModeTip}>
        <div
          style={{
            opacity: 0.5,
            "font-size": "1.5rem",
            translate: "0 2em",
            "text-wrap": "balance",
            "white-space": "break-spaces",
            "padding-inline": "2rem",
          }}
        >
          {t("home.description")}
        </div>
      </Show>
    </div>
  );
};

export default HomePage;
