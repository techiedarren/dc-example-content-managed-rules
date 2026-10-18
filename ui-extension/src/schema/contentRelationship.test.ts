import { describe, expect, it } from "vitest";
import {
  ContentRelationshipType,
  InvalidContentRelationshipSchemaError,
  isContentRelationship,
  parseContentRelationshipSchema,
} from "./contentRelationship";

const LINK = ContentRelationshipType.CONTENT_LINK;
const REFERENCE = ContentRelationshipType.CONTENT_REFERENCE;

describe("isContentRelationship", () => {
  it("accepts content links and references", () => {
    for (const schema of [LINK, REFERENCE]) {
      expect(
        isContentRelationship({ _meta: { schema }, id: "1", contentType: "a" }),
      ).toBe(true);
    }
  });

  it("rejects anything else", () => {
    expect(isContentRelationship(undefined)).toBe(false);
    expect(isContentRelationship("id")).toBe(false);
    expect(isContentRelationship({ id: "1", contentType: "a" })).toBe(false);
    expect(
      isContentRelationship({
        _meta: { schema: "other" },
        id: "1",
        contentType: "a",
      }),
    ).toBe(false);
  });
});

describe("parseContentRelationshipSchema", () => {
  it("reads the type and content types from allOf", () => {
    expect(
      parseContentRelationshipSchema({
        allOf: [
          { $ref: REFERENCE },
          { properties: { contentType: { enum: ["a", "b"] } } },
        ],
      }),
    ).toEqual({
      relationshipType: "content",
      type: REFERENCE,
      contentTypes: ["a", "b"],
    });
  });

  it("reads keywords from the outer schema too", () => {
    expect(
      parseContentRelationshipSchema({
        $ref: LINK,
        allOf: [{ properties: { contentType: { enum: ["a"] } } }],
      }),
    ).toEqual({ relationshipType: "content", type: LINK, contentTypes: ["a"] });
  });

  it("throws without a content link or reference", () => {
    expect(() => parseContentRelationshipSchema({ type: "string" })).toThrow(
      InvalidContentRelationshipSchemaError,
    );
  });

  it("throws without content types", () => {
    expect(() =>
      parseContentRelationshipSchema({ allOf: [{ $ref: LINK }] }),
    ).toThrow(InvalidContentRelationshipSchemaError);
  });
});
