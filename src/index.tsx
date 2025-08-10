import { render } from "solid-js/web";
import "virtual:svg-icons/register";
import WipPage from "./pages/wip";
import { I18nProvider } from "./i18n/context";
render(
  () => (
    <I18nProvider>
      <WipPage />
    </I18nProvider>
  ),
  document.getElementById("root")!
);
