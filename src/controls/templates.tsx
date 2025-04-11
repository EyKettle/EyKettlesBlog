import { Button } from "../components/button";

export const backButton = (callback: () => void) => (
  <Button
    icon={"\u{e10e}"}
    type="ghost"
    size="large"
    rounded={true}
    onClick={callback}
    style={{
      height: "80px",
      width: "80px",
    }}
  />
);
