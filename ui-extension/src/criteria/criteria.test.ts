import { describe, expect, it } from "vitest";
import { fields as fieldParams } from "../stories/fixtures";
import {
  criteriaToQuery,
  describeCriteria,
  queryToCriteria,
  toQueryField,
} from "./criteria";

const fields = fieldParams.map(toQueryField);

const roundTrip = (criteria: Parameters<typeof criteriaToQuery>[0]) =>
  queryToCriteria(criteriaToQuery(criteria), fields);

describe("criteria", () => {
  it("treats an empty query as always matching", () => {
    expect(queryToCriteria({ combinator: "and", rules: [] }, fields)).toBe(
      true,
    );
    expect(criteriaToQuery(true).rules).toEqual([]);
    expect(criteriaToQuery(undefined).rules).toEqual([]);
  });

  it("writes list operators as JSON Logic arrays", () => {
    const query = {
      combinator: "and",
      rules: [
        {
          field: "product.category",
          operator: "in",
          value: "t-shirts,hoodies",
        },
        { field: "product.category", operator: "notIn", value: ["mugs"] },
      ],
    };
    expect(queryToCriteria(query, fields)).toEqual({
      and: [
        { in: [{ var: "product.category" }, ["t-shirts", "hoodies"]] },
        { "!": { in: [{ var: "product.category" }, ["mugs"]] } },
      ],
    });
  });

  it("parses numbers only for number fields", () => {
    const query = {
      combinator: "and",
      rules: [
        { field: "product.price", operator: ">", value: "10" },
        { field: "product.brand", operator: "=", value: "123" },
      ],
    };
    expect(queryToCriteria(query, fields)).toEqual({
      and: [
        { ">": [{ var: "product.price" }, 10] },
        { "==": [{ var: "product.brand" }, "123"] },
      ],
    });
  });

  it("round-trips saved criteria", () => {
    const criteria = {
      and: [
        { "==": [{ var: "product.brand" }, "Disney"] },
        { in: [{ var: "product.category" }, ["t-shirts", "hoodies"]] },
        { ">": [{ var: "product.price" }, 20] },
      ],
    };
    expect(roundTrip(criteria)).toEqual(criteria);
  });

  it("wraps a single condition in a group", () => {
    const criteria = { in: [{ var: "product.sku" }, ["SKU-1001"]] };
    expect(roundTrip(criteria)).toEqual({ and: [criteria] });
  });

  it("describes criteria in plain language", () => {
    expect(describeCriteria(true, fields)).toBe("Always matches");
    expect(
      describeCriteria({ "==": [{ var: "product.brand" }, "Disney"] }, fields),
    ).toContain("Brand");
  });
});
