import {
  InvalidContentRelationshipSchemaError,
  parseContentRelationshipSchema,
  type ParsedContentRelationshipSchema,
} from "./contentRelationship";
import { inferSchemaType } from "./inferSchemaType";
import type { JSONSchema } from "./types";

/** How a rule's result is edited, derived from the `result` property in the field schema. */
export type ResultType = { schema: JSONSchema } & (
  | { kind: "string" }
  | { kind: "enum"; options: string[] }
  | {
      kind: "content-relationship";
      relationship: ParsedContentRelationshipSchema;
    }
  | { kind: "unsupported"; reason: string }
);

/** Reads the `result` schema from the rules array field schema. */
export function getResultSchema(
  fieldSchema: JSONSchema | undefined,
): JSONSchema | undefined {
  const items = fieldSchema?.items;
  return items && !Array.isArray(items) ? items.properties?.result : undefined;
}

export function getResultType(fieldSchema: JSONSchema | undefined): ResultType {
  const schema = getResultSchema(fieldSchema);
  if (!schema) {
    return {
      kind: "unsupported",
      schema: {},
      reason: "The field schema doesn't define items.properties.result.",
    };
  }

  try {
    return {
      kind: "content-relationship",
      schema,
      relationship: parseContentRelationshipSchema(schema),
    };
  } catch (error) {
    if (!(error instanceof InvalidContentRelationshipSchemaError)) {
      throw error;
    }
  }

  if (
    Array.isArray(schema.enum) &&
    schema.enum.every((value) => typeof value === "string")
  ) {
    return { kind: "enum", schema, options: schema.enum };
  }

  const type = inferSchemaType(schema);
  if (type === "string") {
    return { kind: "string", schema };
  }

  return {
    kind: "unsupported",
    schema,
    reason: `Results of type "${type ?? "unknown"}" aren't supported. Use a string, an enum, a content link or a content reference.`,
  };
}
