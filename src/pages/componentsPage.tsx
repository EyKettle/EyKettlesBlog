import { Component, JSX } from "solid-js";
import { Button } from "../components/button";
import { Card } from "../components/card";
import { PageContainer } from "../components/pageContainer";
import { Switch } from "../components/switch";
import InputBox from "../components/inputbox";

interface componentsPageProps {
  translator: any;
  operations: {
    back: () => void;
  };
}

const ComponentsPage: Component<componentsPageProps> = (props) => {
  const t = props.translator;
  const styleOfSection = {
    display: "flex",
    gap: "1rem",
  } as JSX.CSSProperties;
  let switchTo = (_index: number, _param?: string) => {
    console.error("Not initialized");
  };

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        "padding-top": "12rem",
        "padding-bottom": "6rem",
        "align-items": "center",
        gap: "1rem",
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
          "flex-direction": "column",
          "align-items": "center",
          gap: "1rem",
        }}
      >
        <h1>{t("library.title")}</h1>
        <div style={styleOfSection}>
          <Button text={t("library.button.normal")} />
          <Button text={t("library.button.ghost")} type="ghost" />
        </div>
        <div
          style={{
            ...styleOfSection,
            width: "100vw",
            "justify-content": "center",
          }}
        >
          <div
            style={{
              ...styleOfSection,
              "max-width": "100%",
              "padding-inline": "1.5rem",
              "overflow-x": "scroll",
              "padding-block": "2rem",
            }}
            card-height="10rem"
            card-width="15rem"
          >
            <Card
              title={t("library.card.name")}
              description={t("library.card.effect.all")}
              effect="all"
            />
            <Card
              title={t("library.card.name")}
              description={t("library.card.effect.float")}
              effect="float"
            />
            <Card
              title={t("library.card.name")}
              description={t("library.card.effect.none")}
              effect="none"
            />
          </div>
        </div>
        <div
          style={{
            ...styleOfSection,
            "flex-direction": "column",
            height: "20rem",
          }}
        >
          <Switch
            current={0}
            children={[
              { label: "Page 0", callback: () => switchTo(0) },
              { label: "Page 1", callback: () => switchTo(1) },
              { label: "Page 2", callback: () => switchTo(2) },
            ]}
          />
          <PageContainer
            defaultIndex={0}
            pageInfos={[
              { name: "Page 0" },
              { name: "Page 1" },
              { name: "Page 2" },
            ]}
            pageInit={(page) => {
              page.style.display = "flex";
              page.style.justifyContent = "center";
              page.style.alignItems = "center";
              page.style.height = "100%";
              page.style.width = "100%";
            }}
            getMethods={(s) => (switchTo = s)}
            extraStyle={{
              "border-radius": "1rem",
              border: "0.0625rem solid var(--border-default)",
            }}
          >
            <div>{t("library.pageContainer") + " / Page0"}</div>
            <div>{t("library.pageContainer") + " / Page1"}</div>
            <div>{t("library.pageContainer") + " / Page2"}</div>
          </PageContainer>
        </div>
        <div style={styleOfSection}>
          <InputBox multiline={true} placeholder={t("library.input")} />
        </div>
      </div>
    </div>
  );
};

export default ComponentsPage;
