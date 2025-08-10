import { animate, createSpring } from "animejs";
import { useI18n } from "../i18n/context";
import Box from "../components/box";
import { NormalEase } from "../utils";

const WipPage = () => {
  const { t } = useI18n();
  return (
    <div
      class="page base-page"
      style={{
        "user-select": "none",
        "font-size": "var(--font-large)",
        "will-change": "scale",
        opacity: "0",
        transform: "scale(0.6)",
        transition: "none",
      }}
      ref={(e) => {
        setTimeout(() => {
          animate(e, {
            opacity: 1,
            scale: 1,
            ease: createSpring({
              stiffness: 400,
              damping: 20,
            }),
          });
          setTimeout(() => {
            const progress = document.getElementById("progress");
            progress!.style.width = "var(--progress)";
          }, 100);
        }, 600);
      }}
    >
      <Box
        style={{
          position: "relative",
          "border-radius": "var(--radius-large)",
          padding: "var(--padding-large)",
        }}
      >
        <div
          id="progress"
          style={{
            position: "absolute",
            left: "0",
            "inset-block": "0",
            width: "0%",
            "background-color": "var(--color-button-main-hover)",
            "will-change": "width",
            transition: "all 0.8s cubic-bezier(0.5, 0, 0, 1), clip-path 0s",
          }}
        />
        <span
          style={{
            position: "relative",
            "z-index": "2",
          }}
        >
          {t("remake")}
        </span>
      </Box>
    </div>
  );
};
export default WipPage;
