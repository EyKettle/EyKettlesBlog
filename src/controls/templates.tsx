import { Button } from "../components/button";
import { buttonSize, roundButton } from "../components/utils";

export const backButton = (callback: () => void) => (
  <Button
    icon={"\u{e10e}"}
    type="ghost"
    onClick={callback}
    style={{
      "flex-shrink": 0,
      ...buttonSize("large"),
      ...roundButton("80px"),
    }}
  />
);
