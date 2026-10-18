import { useEffect, useState } from "react";
import { useEditorServices } from "../services/EditorServicesContext";

/** Looks up the name of a linked content item. */
export function useContentItemLabel(
  id: string | undefined,
): string | undefined {
  const { contentRelationships } = useEditorServices();
  const [resolved, setResolved] = useState<{ id: string; label?: string }>();

  useEffect(() => {
    if (!id) {
      return;
    }
    let cancelled = false;
    void contentRelationships.getLabel(id).then((label) => {
      if (!cancelled) {
        setResolved({ id, label });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [contentRelationships, id]);

  return resolved && resolved.id === id ? resolved.label : undefined;
}
