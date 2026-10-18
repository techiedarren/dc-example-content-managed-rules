import { dataSources } from "../data-sources/dataSources";
import type { ContentRelationship } from "../schema/contentRelationship";
import type { EditorServices } from "../services/types";

export const PDP_LAYOUT_SCHEMA = "https://example.com/pdp-layout.json";

export const contentItems = [
  { id: "7f6a1c2e-0000-4000-8000-000000000001", label: "Standard PDP layout" },
  { id: "7f6a1c2e-0000-4000-8000-000000000002", label: "Apparel PDP layout" },
  { id: "7f6a1c2e-0000-4000-8000-000000000003", label: "Disney PDP layout" },
  { id: "7f6a1c2e-0000-4000-8000-000000000004", label: "Footwear PDP layout" },
];

let picks = 0;

/** Stands in for the Amplience SDK: picking cycles through the items above. */
export const mockServices: EditorServices = {
  dataSources,
  contentRelationships: {
    async pick({ type, contentTypes }): Promise<ContentRelationship> {
      const item = contentItems[picks++ % contentItems.length];
      return {
        _meta: { schema: type },
        id: item.id,
        contentType: contentTypes[0] ?? PDP_LAYOUT_SCHEMA,
      };
    },
    async getLabel(id) {
      return contentItems.find((item) => item.id === id)?.label;
    },
  },
};
