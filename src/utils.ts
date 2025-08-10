import { getSquirclePath } from "pretty-squircle/mini";
import { Setter } from "solid-js";

export const NormalEase = { ease: "cubicBezier(0.5,0,0,1)", duration: 400 };
export const FadeInEase = { ease: "cubicBezier(0,0,0,1)", duration: 200 };
export const FadeOutEase = { ease: "cubicBezier(0.5,0,1,1)", duration: 150 };
export const FadeInEaseLong = { ease: "cubicBezier(0,0,0,1)", duration: 400 };
export const FadeOutEaseShort = {
  ease: "cubicBezier(0.5,0,1,1)",
  duration: 100,
};

export const dynamicSquircle = (
  e: ResizeObserverEntry[],
  setPath: Setter<string>
) => {
  const { inlineSize, blockSize } = e[0].borderBoxSize[0];
  setPath(
    getSquirclePath({
      height: blockSize,
      width: inlineSize,
      cornerRadius: parseFloat(getComputedStyle(e[0].target).borderRadius),
    })
  );
};
