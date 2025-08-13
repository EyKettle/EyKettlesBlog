import { useI18n } from "../i18n/context";
import { createSignal, onMount } from "solid-js";
import { getSquirclePath } from "pretty-squircle/mini";
import { animate, createSpring } from "animejs";

const WipPage = () => {
  const { t } = useI18n();

  let box: HTMLDivElement;
  let backText: HTMLSpanElement;
  let text: HTMLSpanElement;
  const handleChange = () => {
    const rect = text.getBoundingClientRect();
    const { x, y } = box.getBoundingClientRect();
    backText.style.translate = `${rect.x - x}px ${rect.y - y}px`;
    backText.style.opacity = "";
  };
  onMount(() => {
    handleChange();
  });

  const observer = new ResizeObserver((e) => {
    const { height, width } = e[0].target.getBoundingClientRect();
    const { blockSize, inlineSize } = e[1].borderBoxSize[0];

    backText.style.translate = `${(inlineSize - width) / 2}px ${
      (blockSize - height) / 2
    }px`;
    backText.style.opacity = "";
  });
  const [path, setPath] = createSignal("");
  const boxObserver = new ResizeObserver((e) => {
    const { blockSize, inlineSize } = e[0].borderBoxSize[0];
    setPath(
      getSquirclePath({
        height: blockSize,
        width: inlineSize,
        cornerRadius: parseFloat(getComputedStyle(e[0].target).borderRadius),
        cornerSmoothing: 1,
      })
    );
  });

  onMount(() => {
    observer.observe(text);
    observer.observe(box);
    boxObserver.observe(box);
  });

  return (
    <div
      class="page base-page"
      style={{
        "user-select": "none",
        "will-change": "scale",
        opacity: "0",
        transform: "scale(0.6)",
        transition: "none",
        "--progress": "0",
      }}
      ref={(e) => {
        fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            get: ["PROGRESS"],
          }),
        }).then(async (result) => {
          const data: Record<string, string | null> = await result.json();
          e.style.setProperty("--progress", data.PROGRESS);
        });

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
      <div
        ref={(e) => (box = e)}
        style={{
          "clip-path": `path('${path()}')`,
          "border-radius": "var(--radius-large)",
          padding: "var(--padding-large)",
          "background-color": "var(--color-back-primary)",
          position: "relative",
        }}
      >
        <div
          id="progress"
          style={{
            position: "absolute",
            left: "0",
            "inset-block": "0",
            width: "0%",
            "background-color": "var(--primary)",
            "will-change": "width",
            transition: "all 0.8s cubic-bezier(0.5, 0, 0, 1), clip-path 0s",
            overflow: "hidden",
          }}
        >
          <span
            ref={(e) => (backText = e)}
            style={{
              position: "absolute",
              "font-size": "var(--font-large)",
              opacity: 0,
              color: "var(--onPrimary)",
            }}
          >
            {t("remake")}
          </span>
        </div>
        <span
          ref={(e) => (text = e)}
          style={{
            "font-size": "var(--font-large)",
          }}
        >
          {t("remake")}
        </span>
      </div>
    </div>
  );
};
export default WipPage;
