import type { JSONSchema } from "./types";

// Ported from Amplience's content-type-utils. `$ref`s are matched as declared, not resolved.

export const ContentRelationshipType = {
  CONTENT_LINK:
    "http://bigcontent.io/cms/schema/v1/core#/definitions/content-link",
  CONTENT_REFERENCE:
    "http://bigcontent.io/cms/schema/v1/core#/definitions/content-reference",
} as const;

export type ContentRelationshipType =
  (typeof ContentRelationshipType)[keyof typeof ContentRelationshipType];

export interface ContentRelationship {
  _meta: { schema: ContentRelationshipType };
  id: string;
  contentType: string;
}

export interface ParsedContentRelationshipSchema {
  relationshipType: "content";
  type: ContentRelationshipType;
  contentTypes: string[];
}

export class InvalidContentRelationshipSchemaError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(
      this,
      InvalidContentRelationshipSchemaError.prototype,
    );
  }
}

const isContentRelationshipType = (
  value: unknown,
): value is ContentRelationshipType =>
  value === ContentRelationshipType.CONTENT_LINK ||
  value === ContentRelationshipType.CONTENT_REFERENCE;

export function isContentRelationship(
  value: unknown,
): value is ContentRelationship {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<ContentRelationship>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.contentType === "string" &&
    isContentRelationshipType(candidate._meta?.schema)
  );
}

/** The schema's `allOf` entries, plus the outer schema's own keywords. */
function getAllOf(schema: JSONSchema): JSONSchema[] {
  if (!Array.isArray(schema.allOf)) {
    return [schema];
  }
  const { allOf, ...outer } = schema;
  return Object.keys(outer).length > 0 ? [outer, ...allOf] : allOf;
}

export function parseContentRelationshipSchema(
  schema: JSONSchema,
): ParsedContentRelationshipSchema {
  const allOf = schema ? getAllOf(schema) : [];

  const declaredRef = allOf.find((x) => isContentRelationshipType(x?.$ref));
  if (!declaredRef || !isContentRelationshipType(declaredRef.$ref)) {
    throw new InvalidContentRelationshipSchemaError(
      "Schema is not a valid content link or content reference",
    );
  }

  const contentTypes: string[] = [];
  for (const entry of allOf) {
    const contentTypeEnum = entry?.properties?.contentType?.enum;
    if (Array.isArray(contentTypeEnum)) {
      for (const contentTypeId of contentTypeEnum) {
        if (
          typeof contentTypeId === "string" &&
          !contentTypes.includes(contentTypeId)
        ) {
          contentTypes.push(contentTypeId);
        }
      }
    }
  }

  if (contentTypes.length === 0) {
    throw new InvalidContentRelationshipSchemaError(
      "Schema is not a valid content link or content reference",
    );
  }

  return {
    relationshipType: "content",
    type: declaredRef.$ref,
    contentTypes,
  };
}
