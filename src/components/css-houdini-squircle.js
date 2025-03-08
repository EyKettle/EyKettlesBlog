import { getSvgPath } from "figma-squircle";
class SquircleClass {
  static get contextOptions() {
    return { alpha: true };
  }
  static get inputProperties() {
    return [
      "--squircle-fill",
      "--squircle-smooth",
      "--squircle-radius",
      "--squircle-radius-top-left",
      "--squircle-radius-top-right",
      "--squircle-radius-bottom-right",
      "--squircle-radius-bottom-left",
      "--squircle-outline",
      "--squircle-outline-top",
      "--squircle-outline-right",
      "--squircle-outline-bottom",
      "--squircle-outline-left",
      "--squircle-outline-color",
    ];
  }
  paint(ctx, geom, properties) {
    const squircleSmooth = properties.get("--squircle-smooth")?.value || 0.6;
    const individualRadiiProps = SquircleClass.inputProperties.slice(3, 7);
    let squircleRadii = individualRadiiProps.map((prop) => {
      const value = properties.get(prop)?.value;
      if (!value || value === 0) return NaN;
      else return value;
    });
    if (squircleRadii.every(isNaN)) {
      const radius = properties.get("--squircle-radius")?.value;
      squircleRadii = [radius, radius, radius, radius];
    } else {
      squircleRadii = squircleRadii.map((r) => (!r ? 0 : r));
    }
    const outlineProps = SquircleClass.inputProperties.slice(8, 12);
    let outlineWidths = outlineProps.map((prop) => {
      const value = properties.get(prop)?.value;
      if (!value || value === 0) return NaN;
      else return value;
    });

    const squircleOutline = properties.get("--squircle-outline")?.value;

    if (!outlineWidths.every(isNaN) && outlineWidths.some(isNaN)) {
      outlineWidths = outlineWidths.map((w) => (w !== NaN ? w : 0));
    }
    let squircleColor = properties.get("--squircle-fill")?.toString();

    const [topLeft, topRight, bottomRight, bottomLeft] = squircleRadii;
    const params = {
      topLeftCornerRadius: topLeft,
      topRightCornerRadius: topRight,
      bottomRightCornerRadius: bottomRight,
      bottomLeftCornerRadius: bottomLeft,
      cornerSmoothing: squircleSmooth,
      width: geom.width,
      height: geom.height,
      preserveSmoothing: true,
    };

    const path = new Path2D(getSvgPath(params));

    ctx.fillStyle = squircleColor;
    ctx.fill(path);

    ctx.clip(path);
    if (
      outlineWidths.every(isNaN) ||
      outlineWidths.some((width) => width > 0)
    ) {
      const outlineColorValue = properties
        .get("--squircle-outline-color")
        .toString();
      const squircleOutlineColor =
        outlineColorValue && outlineColorValue !== "rgba(0, 0, 0, 0)"
          ? outlineColorValue
          : squircleColor;
      if (squircleOutline > 0 && outlineWidths.every(isNaN)) {
        ctx.save();
        ctx.strokeStyle = squircleOutlineColor;
        ctx.lineWidth = squircleOutline * 2;
        ctx.stroke(path);
        ctx.restore();
      } else {
        const [top, right, bottom, left] = [
          isNaN(outlineWidths[0]) ? 0 : outlineWidths[0],
          isNaN(outlineWidths[1]) ? 0 : outlineWidths[1],
          isNaN(outlineWidths[2]) ? 0 : outlineWidths[2],
          isNaN(outlineWidths[3]) ? 0 : outlineWidths[3],
        ];
        const maxWidth = Math.max(top, right, bottom, left);
        if (maxWidth > 0 && squircleOutlineColor !== "rgba(0, 0, 0, 0)") {
          ctx.save();
          ctx.translate(-maxWidth - 0.1 + left, -maxWidth - 0.1 + top);
          ctx.strokeStyle = squircleOutlineColor;
          ctx.lineWidth = maxWidth * 2;
          const p = params;
          params.topLeftCornerRadius += maxWidth + 0.1;
          params.topRightCornerRadius += maxWidth + 0.1;
          params.bottomRightCornerRadius += maxWidth + 0.1;
          params.bottomLeftCornerRadius += maxWidth + 0.1;

          p.height += maxWidth * 2 + 0.2 - top - bottom;
          p.width += maxWidth * 2 + 0.2 - left - right;
          const path = new Path2D(getSvgPath(p));
          ctx.stroke(path);
          ctx.restore();
        }
      }
    }
  }
}
if (typeof registerPaint !== "undefined") {
  registerPaint("squircle", SquircleClass);
}
