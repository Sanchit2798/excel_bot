import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import Reload from "./components/Reload";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
/* global document, Office, module, require, HTMLElement */
const title = "Contoso Task Pane Add-in";
const rootElement: HTMLElement | null = document.getElementById("container");
const root = rootElement ? createRoot(rootElement) : undefined;

/* Render application after Office initializes */
let isOfficeLoaded = false;

Office.onReady(() => {
  root?.render(
    <FluentProvider theme={webLightTheme}>
      <App title={title} />
    </FluentProvider>
  );
  isOfficeLoaded = true;
});

export function getIsOfficeLoaded(){
  return isOfficeLoaded;
}

root.render(<Reload />);

if ((module as any).hot) {
  (module as any).hot.accept("./components/App", () => {
    const NextApp = require("./components/App").default;
    root?.render(NextApp);
  });
}
