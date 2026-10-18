import { createContext, useContext } from "react";
import type { EditorServices } from "./types";

export const EditorServicesContext = createContext<EditorServices | null>(null);

export function useEditorServices(): EditorServices {
  const services = useContext(EditorServicesContext);
  if (!services) {
    throw new Error(
      "useEditorServices must be used inside EditorServicesContext",
    );
  }
  return services;
}
