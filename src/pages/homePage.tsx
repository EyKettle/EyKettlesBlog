import { Component } from "solid-js";
import { Card } from "../components/card";
import { Pages } from "../App";

interface HomePageProps {
  translator: any;
  operations: {
    handleSwitch: (target: number) => void;
  };
}

const HomePage: Component<HomePageProps> = (props) => {
  const t = props.translator;

  const handleCard2 = () => {
    props.operations.handleSwitch(Pages.Reading);
    return true;
  };

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        "justify-content": "center",
        "align-items": "center",
        "padding-bottom": "8rem",
        gap: "1rem",
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
        card-height="min(40vw, 18rem)"
        card-width="min(30vw, 22rem)"
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
      <div style={{ opacity: 0.5, "font-size": "1.5rem", translate: "0 2em" }}>
        {t("home.description")}
      </div>
    </div>
  );
};

export default HomePage;
