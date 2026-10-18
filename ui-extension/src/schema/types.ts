export type JSONSchemaTypeName =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array"
  | "null";

export interface JSONSchema {
  $ref?: string;
  title?: string;
  description?: string;
  type?: JSONSchemaTypeName | JSONSchemaTypeName[];
  const?: unknown;
  enum?: unknown[];
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema | JSONSchema[];
  allOf?: JSONSchema[];
  [keyword: string]: unknown;
}
