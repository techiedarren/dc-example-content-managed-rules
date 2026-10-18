import { describe, expect, it } from "vitest";
import { RuleEngine, type Rule } from "./rule-engine";

type Layout = "default" | "apparel" | "footwear" | "disney";

interface ProductContext {
  product: { category: string; brand: string };
}

const product = (category: string, brand = "Generic"): ProductContext => ({
  product: { category, brand },
});

describe("RuleEngine", () => {
  it("matches when product category equals a value", () => {
    const engine = new RuleEngine<Layout, ProductContext>([
      {
        criteria: { "==": [{ var: "product.category" }, "shoes"] },
        result: "footwear",
      },
    ]);

    expect(engine.evaluate(product("shoes"))).toBe("footwear");
    expect(engine.evaluate(product("hats"))).toBeUndefined();
  });

  it("matches when product category is in a list", () => {
    const engine = new RuleEngine<Layout, ProductContext>([
      {
        criteria: {
          in: [{ var: "product.category" }, ["t-shirts", "hoodies", "jackets"]],
        },
        result: "apparel",
      },
    ]);

    expect(engine.evaluate(product("hoodies"))).toBe("apparel");
    expect(engine.evaluate(product("jackets"))).toBe("apparel");
    expect(engine.evaluate(product("shoes"))).toBeUndefined();
  });

  it("matches when brand is Disney", () => {
    const engine = new RuleEngine<Layout, ProductContext>([
      {
        criteria: { "==": [{ var: "product.brand" }, "Disney"] },
        result: "disney",
      },
    ]);

    expect(engine.evaluate(product("t-shirts", "Disney"))).toBe("disney");
    expect(engine.evaluate(product("t-shirts", "Marvel"))).toBeUndefined();
  });

  it("returns the first matching rule, in priority order", () => {
    const engine = new RuleEngine<Layout, ProductContext>([
      {
        criteria: { "==": [{ var: "product.brand" }, "Disney"] },
        result: "disney",
      },
      {
        criteria: {
          in: [{ var: "product.category" }, ["t-shirts", "hoodies"]],
        },
        result: "apparel",
      },
      { criteria: true, result: "default" },
    ]);

    expect(engine.evaluate(product("t-shirts", "Disney"))).toBe("disney");
    expect(engine.evaluate(product("t-shirts"))).toBe("apparel");
    expect(engine.evaluate(product("mugs"))).toBe("default");
  });

  it("combines criteria with and", () => {
    const engine = new RuleEngine<Layout, ProductContext>([
      {
        criteria: {
          and: [
            { "==": [{ var: "product.brand" }, "Disney"] },
            { "==": [{ var: "product.category" }, "shoes"] },
          ],
        },
        result: "footwear",
      },
    ]);

    expect(engine.evaluate(product("shoes", "Disney"))).toBe("footwear");
    expect(engine.evaluate(product("shoes"))).toBeUndefined();
    expect(engine.evaluate(product("t-shirts", "Disney"))).toBeUndefined();
  });

  it("skips inactive rules", () => {
    const engine = new RuleEngine<Layout, ProductContext>([
      {
        criteria: { "==": [{ var: "product.brand" }, "Disney"] },
        result: "disney",
        active: false,
      },
      {
        criteria: {
          in: [{ var: "product.category" }, ["t-shirts", "hoodies"]],
        },
        result: "apparel",
        active: true,
      },
      { criteria: true, result: "default" },
    ]);

    expect(engine.size).toBe(2);
    expect(engine.evaluate(product("t-shirts", "Disney"))).toBe("apparel");
    expect(engine.evaluate(product("mugs", "Disney"))).toBe("default");
  });

  it("does not compile inactive rules, so an invalid inactive rule does not fail the load", () => {
    const engine = new RuleEngine<Layout, ProductContext>([
      { criteria: { notAnOperator: [1] }, result: "disney", active: false },
      { criteria: true, result: "default" },
    ]);

    expect(engine.evaluate(product("shoes"))).toBe("default");
  });

  it("replaces rules when new ones are loaded", () => {
    const engine = new RuleEngine<Layout, ProductContext>([
      {
        criteria: { "==": [{ var: "product.category" }, "shoes"] },
        result: "footwear",
      },
    ]);

    engine.load([
      {
        criteria: { "==": [{ var: "product.category" }, "shoes"] },
        result: "default",
      },
    ]);

    expect(engine.evaluate(product("shoes"))).toBe("default");
  });

  it("keeps the existing rules if the new rules fail to compile", () => {
    const rules: Rule<Layout>[] = [
      {
        criteria: { "==": [{ var: "product.category" }, "shoes"] },
        result: "footwear",
      },
    ];
    const engine = new RuleEngine<Layout, ProductContext>(rules);

    expect(() =>
      engine.load([{ criteria: { notAnOperator: [1] }, result: "default" }]),
    ).toThrow();
    expect(engine.size).toBe(1);
    expect(engine.evaluate(product("shoes"))).toBe("footwear");
  });

  it("supports independent instances", () => {
    const pdpLayouts = new RuleEngine<Layout, ProductContext>([
      {
        criteria: { "==": [{ var: "product.brand" }, "Disney"] },
        result: "disney",
      },
    ]);
    const badges = new RuleEngine<string, ProductContext>([
      {
        criteria: { "==": [{ var: "product.brand" }, "Disney"] },
        result: "Official Disney merch",
      },
    ]);

    const context = product("t-shirts", "Disney");
    expect(pdpLayouts.evaluate(context)).toBe("disney");
    expect(badges.evaluate(context)).toBe("Official Disney merch");
  });
});
