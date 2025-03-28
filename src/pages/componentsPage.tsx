import { Component, JSX } from "solid-js";
import { Button } from "../components/button";
import { Card } from "../components/card";
import { PageContainer } from "../components/pageContainer";
import { Switch } from "../components/switch";
import InputBox from "../components/inputBox";
import Loading from "../components/loading";
import { animateMini } from "motion";
import Squircle from "../components/squircle";
import { initReport } from "../components/utils";

interface componentsPageProps {
  translator: any;
  operations: {
    back: () => void;
    enterChatPage: () => void;
  };
  isDark: boolean;
}

const ComponentsPage: Component<componentsPageProps> = (props) => {
  const t = props.translator;
  const styleOfSection = {
    display: "flex",
    gap: "1rem",
  } as JSX.CSSProperties;
  let switchTo = (_index: number, _param?: string) => initReport();

  return (
    <div
      style={{
        display: "flex",
        "flex-direction": "column",
        "padding-top": "8.5rem",
        "padding-bottom": "6rem",
        "align-items": "center",
        gap: "1rem",
        width: "100%",
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
          <Button label={t("library.button.normal")} />
          <Button label={t("library.button.ghost")} type="ghost" />
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
            default={0}
            children={[
              { label: "Page 0", onClick: () => switchTo(0) },
              { label: "Page 1", onClick: () => switchTo(1) },
              { label: "Page 2", onClick: () => switchTo(2) },
            ]}
          />
          <div
            style={{
              height: "100%",
              width: "100%",
              overflow: "hidden",
              position: "relative",
              "background-color": "var(--color-surface-dark)",
              "border-radius": "1rem",
              "border-style": "solid",
              "border-top-width": `${props.isDark ? "0" : "0.0625rem"}`,
              "border-bottom-width": `${props.isDark ? "0.0625rem" : "0"}`,
              "border-color": "var(--color-border-active)",
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
              pageInit={(page, index) => {
                page.style.display = "grid";
                page.style.placeItems = "center";
                page.style.willChange = "rotate, scale, translate";
                switch (index) {
                  case 1:
                    page.style.translate = "20rem 0";
                    break;
                  case 2:
                    page.style.translate = "0 20rem";
                    break;
                }
              }}
              getMethods={(s) => (switchTo = s)}
              switchMotion={(
                oldPage,
                newPage,
                isForward,
                direction,
                container
              ) =>
                new Promise((resolve) => {
                  const newPageExist = container.contains(newPage);
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
                      {
                        translate: newPageExist ? "0 0" : ["0 20rem", "0 0"],
                        scale: 1,
                      },
                      { duration: 1, ease: [0.5, 0.2, 0, 1] }
                    ).then(resolve);
                  } else {
                    animateMini(
                      oldPage,
                      {
                        translate: isForward
                          ? "-20rem 0"
                          : direction[0] === 2
                          ? "0 20rem"
                          : "20rem 0",
                      },
                      { duration: 1, ease: [0.5, 0.2, 0, 1] }
                    );
                    animateMini(
                      newPage,
                      {
                        translate: newPageExist
                          ? "0 0"
                          : [isForward ? "20rem 0" : "-20rem 0", "0 0"],
                        scale: 1,
                        opacity: 1,
                        rotate: "0deg",
                      },
                      { duration: 1, ease: [0.5, 0.2, 0, 1] }
                    ).then(resolve);
                  }
                  return 1000;
                })
              }
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
          </div>
        </div>
        <div style={styleOfSection}>
          <InputBox multiline={true} placeholder={t("library.input")} />
        </div>
        <div style={styleOfSection}>
          <Loading text={t("library.loading")} />
        </div>
        <div style={{ "flex-direction": "column", ...styleOfSection }}>
          <Squircle
            cornerRadius="2rem"
            fillColor="rgb(27, 27, 27)"
            outlineColor="rgba(255, 255, 255, 1)"
            outlineWidth={"0.1875rem"}
            cornerSmoothing="1"
            style={{
              height: "6rem",
              width: "8rem",
              filter: "drop-shadow(0 0.25rem 0.5rem rgba(0, 0, 0, 0.3))",
              display: "flex",
              "justify-content": "center",
              "align-items": "center",
            }}
          >
            <strong style={{ color: "white" }}>Squircle Test</strong>
          </Squircle>
        </div>
        <Button
          icon={"\ue0ab"}
          label={t("library.enterChatPage")}
          size="medium"
          style={{ "margin-top": "2rem" }}
          onClick={props.operations.enterChatPage}
        />
      </div>
    </div>
  );
};

export default ComponentsPage;
