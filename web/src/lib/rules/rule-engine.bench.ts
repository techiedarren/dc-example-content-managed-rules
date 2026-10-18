import { LogicEngine } from "json-logic-engine";
import { expect, test } from "vitest";
import { RuleEngine, type Rule } from "./rule-engine";

const RULE_COUNT = 500;

// A mix of the rule shapes authors would typically create.
const rules: Rule<string>[] = Array.from({ length: RULE_COUNT }, (_, i) => {
  const category = { var: "product.category" };
  const brand = { var: "product.brand" };
  const result = `layout-${i}`;

  switch (i % 3) {
    case 0:
      return { criteria: { "==": [category, `category-${i}`] }, result };
    case 1:
      return {
        criteria: {
          in: [
            category,
            [`category-${i}-a`, `category-${i}-b`, `category-${i}-c`],
          ],
        },
        result,
      };
    default:
      return {
        criteria: {
          and: [
            { "==": [brand, `brand-${i}`] },
            { "==": [category, `category-${i}`] },
          ],
        },
        result,
      };
  }
});

// Context strings are built at runtime, like real product data. String literals compare
// faster in V8 and would make the results look better than they are in practice.
// Matches only the last rule, so every rule is evaluated.
const lastRuleContext = {
  product: { category: `category-${RULE_COUNT - 1}-b`, brand: "Generic" },
};
const noMatchContext = {
  product: { category: `category-${RULE_COUNT + 1}-b`, brand: "Generic" },
};

const engine = new RuleEngine<string>(rules);

const interpreter = new LogicEngine();
const evaluateInterpreted = (context: unknown) =>
  rules.find((rule) =>
    interpreter.truthy(interpreter.run(rule.criteria, context)),
  )?.result;

// Results are written to a sink so the JIT can't eliminate the work as dead code.
let sink: unknown;

test(`load ${RULE_COUNT} rules`, async ({ bench }) => {
  await bench("compile", () => {
    sink = new RuleEngine<string>(rules);
  }).run();

  expect(sink).toBeInstanceOf(RuleEngine);
});

test(`evaluate ${RULE_COUNT} rules, match on last rule`, async ({ bench }) => {
  await bench.compare(
    bench("compiled", () => {
      sink = engine.evaluate(lastRuleContext);
    }),
    bench("interpreted (baseline)", () => {
      sink = evaluateInterpreted(lastRuleContext);
    }),
  );
});

test(`evaluate ${RULE_COUNT} rules, no match`, async ({ bench }) => {
  await bench.compare(
    bench("compiled", () => {
      sink = engine.evaluate(noMatchContext);
    }),
    bench("interpreted (baseline)", () => {
      sink = evaluateInterpreted(noMatchContext);
    }),
  );
});
