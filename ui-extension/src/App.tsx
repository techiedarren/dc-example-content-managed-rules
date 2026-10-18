import { useEffect, useMemo, useState } from "react";
import { Box } from "@mantine/core";
import { RulesEditor } from "./components/RulesEditor/RulesEditor";
import { dataSources } from "./data-sources/dataSources";
import {
  createSdkContentRelationshipService,
  type RulesExtension,
} from "./extension/sdkServices";
import type { JSONSchema } from "./schema/types";
import { EditorServicesContext } from "./services/EditorServicesContext";
import type { EditorServices } from "./services/types";
import type { Rule } from "./types";

export interface AppProps {
  sdk: RulesExtension;
  initialValue?: Rule[];
}

export function App({ sdk, initialValue }: AppProps) {
  const [readOnly, setReadOnly] = useState(sdk.form.readOnly);

  useEffect(() => {
    sdk.form.onReadOnlyChange(setReadOnly);
    sdk.frame.startAutoResizer();
    return () => sdk.frame.stopAutoResizer();
  }, [sdk]);

  const services = useMemo<EditorServices>(
    () => ({
      dataSources,
      contentRelationships: createSdkContentRelationshipService(sdk),
    }),
    [sdk],
  );

  const params = { ...sdk.params.installation, ...sdk.params.instance };

  const handleChange = (rules: Rule[]) => {
    // The CMS shows validation errors itself, so a rejected value needs no handling here.
    sdk.field.setValue(rules).catch(() => undefined);
  };

  return (
    <EditorServicesContext value={services}>
      <Box p={2}>
        <RulesEditor
          defaultValue={initialValue}
          onChange={handleChange}
          schema={sdk.field.schema as JSONSchema}
          fields={params.fields}
          readOnly={readOnly}
        />
      </Box>
    </EditorServicesContext>
  );
}
