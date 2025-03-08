import { Component, JSX } from "solid-js";
import { Button } from "../components/button";
import { Card } from "../components/card";
import { PageContainer } from "../components/pageContainer";
import { Switch } from "../components/switch";
import InputBox from "../components/inputBox";
import Loading from "../components/loading";
import Squircle from "../components/squircle";
import { animateMini } from "motion";

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
            card-text-wrap=""
          >
            <Card
              title={t("library.card.name")}
              description={t("library.card.effect.all")}
              effect="all"
            />
            <Card
              title={t("library.card.name")}
              description={t("library.card.effect.3d")}
              effect="3d"
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
          <Squircle
            fillColor="var(--surface-dark)"
            cornerRadius="1rem"
            outlineColor="var(--border-active)"
            outlineWidth={{ bottom: "0.0625rem" }}
            style={{
              height: "100%",
              width: "100%",
              "border-radius": "1rem",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <PageContainer
              defaultIndex={0}
              routeMode="none"
              pageInfos={[
                { name: "Page 0" },
                { name: "Page 1" },
                { name: "Page 2" },
              ]}
              pageInit={(page) => {
                page.style.display = "flex";
                page.style.position = "absolute";
                page.style.justifyContent = "center";
                page.style.alignItems = "center";
                page.style.height = "100%";
                page.style.width = "100%";
              }}
              getMethods={(s) => (switchTo = s)}
              switchMotion={(oldPage, newPage, isForward, direction) => {
                if (direction[1] === 2) {
                  animateMini(
                    oldPage,
                    {
                      rotate: "-180deg",
                      scale: 0.6,
                      opacity: 0,
                      translate: "0 -4rem",
                    },
                    { duration: 1, ease: [0.5, 0.2, 0, 1] }
                  );
                  animateMini(
                    newPage,
                    { translate: ["0 20rem", "0 0"], scale: 1 },
                    { duration: 1, ease: [0.5, 0.2, 0, 1] }
                  );
                } else {
                  animateMini(
                    oldPage,
                    { translate: ["0 0", isForward ? "-20rem 0" : "20rem 0"] },
                    { duration: 1, ease: [0.5, 0.2, 0, 1] }
                  );
                  animateMini(
                    newPage,
                    {
                      translate: [isForward ? "20rem 0" : "-20rem 0", "0 0"],
                      scale: 1,
                      opacity: 1,
                      rotate: "0deg",
                    },
                    { duration: 1, ease: [0.5, 0.2, 0, 1] }
                  );
                }
                return 1000;
              }}
            >
              <div>
                {t("library.pageContainer") + " / Page0"}
                <br />
                {t("library.pageTip1")}
              </div>
              <div>
                {t("library.pageContainer") + " / Page1"}
                <br />
                {t("library.pageTip2")}
              </div>
              <div>
                {t("library.pageContainer") + " / Page2"}
                <br />
                {t("library.pageTip3")}
              </div>
            </PageContainer>
          </Squircle>
        </div>
        <div style={styleOfSection}>
          <InputBox multiline={true} placeholder={t("library.input")} />
        </div>
        <div style={styleOfSection}>
          <Loading text={t("library.loading")} />
        </div>
      </div>
    </div>
  );
};

export default ComponentsPage;
