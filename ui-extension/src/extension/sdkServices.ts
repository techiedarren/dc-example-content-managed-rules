import type { ContentFieldExtension } from "dc-extensions-sdk";
import {
  ContentRelationshipType,
  isContentRelationship,
} from "../schema/contentRelationship";
import type { ContentRelationshipService } from "../services/types";
import type { ExtensionParams, Rule } from "../types";

export type RulesExtension = ContentFieldExtension<
  Rule[],
  { installation: ExtensionParams; instance: ExtensionParams }
>;

type HttpMethod = Parameters<RulesExtension["client"]["request"]>[0]["method"];

const MANAGEMENT_API_URL = "https://api.amplience.net/v2/content";

export function createSdkContentRelationshipService(
  sdk: RulesExtension,
): ContentRelationshipService {
  const labels = new Map<string, Promise<string | undefined>>();

  return {
    async pick({ type, contentTypes }) {
      try {
        const picked =
          type === ContentRelationshipType.CONTENT_LINK
            ? await sdk.contentLink.get(contentTypes)
            : await sdk.contentReference.get(contentTypes);
        return isContentRelationship(picked) ? picked : undefined;
      } catch {
        // The content browser rejects when it's closed without a choice.
        return undefined;
      }
    },

    getLabel(id) {
      let label = labels.get(id);
      if (!label) {
        label = sdk.client
          .request<{ label?: string }>({
            url: `${MANAGEMENT_API_URL}/content-items/${encodeURIComponent(id)}`,
            method: "GET" as HttpMethod,
          })
          .then(({ status, data }) =>
            status === 200 && "label" in data ? data.label : undefined,
          );
        labels.set(id, label);
      }
      return label;
    },
  };
}
