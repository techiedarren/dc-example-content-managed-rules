import { describe, expect, it } from "vitest";
import { resultSchemas, rulesFieldSchema } from "../stories/fixtures";
import { ContentRelationshipType } from "./contentRelationship";
import { getResultType } from "./resultType";

describe("getResultType", () => {
  it("edits strings with a text box", () => {
    expect(getResultType(rulesFieldSchema(resultSchemas.string)).kind).toBe(
      "string",
    );
  });

  it("edits string enums with a select", () => {
    expect(getResultType(rulesFieldSchema(resultSchemas.enum))).toMatchObject({
      kind: "enum",
      options: ["default", "apparel", "footwear", "disney"],
    });
  });

  it("edits content links and references with a picker", () => {
    expect(
      getResultType(rulesFieldSchema(resultSchemas.contentLink)),
    ).toMatchObject({
      kind: "content-relationship",
      relationship: { type: ContentRelationshipType.CONTENT_LINK },
    });
    expect(
      getResultType(rulesFieldSchema(resultSchemas.contentReference)),
    ).toMatchObject({
      kind: "content-relationship",
      relationship: { type: ContentRelationshipType.CONTENT_REFERENCE },
    });
  });

  it("reports other types as unsupported", () => {
    expect(
      getResultType(rulesFieldSchema(resultSchemas.unsupported)).kind,
    ).toBe("unsupported");
  });

  it("reports a schema without items.properties.result as unsupported", () => {
    expect(
      getResultType({ type: "array", items: { type: "object" } }).kind,
    ).toBe("unsupported");
    expect(getResultType(undefined).kind).toBe("unsupported");
  });
});
