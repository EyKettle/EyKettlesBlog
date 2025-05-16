import { Button } from "../components/button";
import { buttonSize, roundButton } from "../components/utils";

export const backButton = (callback: () => void) => (
  <Button
    icon={"\u{e10e}"}
    type="ghost"
    onClick={callback}
    style={{
      ...buttonSize("large"),
      ...roundButton("80px"),
      "flex-shrink": 0,
    }}
  />
);
