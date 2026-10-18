import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Alert, Center, Loader, MantineProvider } from "@mantine/core";
import { init } from "dc-extensions-sdk";
import { App } from "./App";
import type { RulesExtension } from "./extension/sdkServices";
import { theme } from "./theme";
import "./global.css";

const root = createRoot(document.getElementById("root")!);

const render = (children: ReactNode) =>
  root.render(
    <StrictMode>
      <MantineProvider theme={theme}>{children}</MantineProvider>
    </StrictMode>,
  );

render(
  <Center p="xl">
    <Loader size="sm" />
  </Center>,
);

// Connect once, outside React, so StrictMode doesn't open two connections.
try {
  const sdk = await init<RulesExtension>();
  const initialValue = await sdk.field.getValue();
  render(<App sdk={sdk} initialValue={initialValue} />);
} catch {
  render(
    <Alert color="orange" title="Not connected to Amplience" m="md">
      This extension must be opened from a content item in Amplience. Run
      Storybook to try it locally.
    </Alert>,
  );
}
