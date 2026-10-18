import type { JSONSchema, JSONSchemaTypeName } from "./types";

/**
 * Returns the data type of the schema as specified by the type keyword.
 * If the type keyword is not defined, this function will try to infer the type
 * by looking at the other keywords that have been defined.
 *
 * Ported from Amplience's json-schema-utils.
 */
export function inferSchemaType(
  schema: JSONSchema | undefined,
): JSONSchemaTypeName | undefined {
  if (!schema) {
    return undefined;
  }
  if (schema.type) {
    if (Array.isArray(schema.type)) {
      return schema.type.length === 1 ? schema.type[0] : undefined;
    }
    return schema.type;
  }
  if (schema.const !== undefined && schema.const !== null) {
    switch (typeof schema.const) {
      case "string":
        return "string";
      case "number":
        return "number";
      case "boolean":
        return "boolean";
      case "object":
        return Array.isArray(schema.const) ? "array" : "object";
    }
  }
  if (schema.properties) {
    return "object";
  }
  if (schema.items) {
    return "array";
  }
  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    switch (typeof schema.enum[0]) {
      case "string":
        return "string";
      case "number":
        return "number";
    }
  }
  return undefined;
}
