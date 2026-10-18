import { isContentRelationship } from "../schema/contentRelationship";
import type { ResultType } from "../schema/resultType";
import { useContentItemLabel } from "./useContentItemLabel";

/** A readable label for a rule's result, or `undefined` if it isn't set. */
export function useResultLabel(
  resultType: ResultType,
  result: unknown,
): string | undefined {
  const relationship =
    resultType.kind === "content-relationship" && isContentRelationship(result)
      ? result
      : undefined;
  const label = useContentItemLabel(relationship?.id);

  if (relationship) {
    return label ?? relationship.id;
  }
  return typeof result === "string" && result !== "" ? result : undefined;
}
