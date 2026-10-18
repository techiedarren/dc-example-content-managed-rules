import { LogicEngine } from "json-logic-engine";

/** A JSON Logic expression, e.g. `{ "==": [{ "var": "product.brand" }, "Disney"] }`. */
export type JsonLogic = Record<string, unknown> | boolean;

export interface Rule<TResult> {
  criteria: JsonLogic;
  result: TResult;
  /** Set to `false` to turn the rule off without deleting it. Defaults to `true`. */
  active?: boolean;
}

interface CompiledRule<TResult> {
  test: (context: unknown) => unknown;
  result: TResult;
}

/**
 * Evaluates an ordered list of rules against a context. Rules are compiled once on
 * `load`, and `evaluate` returns the result of the first rule whose criteria match.
 */
export class RuleEngine<TResult, TContext = unknown> {
  private readonly engine = new LogicEngine();
  private compiled: CompiledRule<TResult>[] = [];

  constructor(rules: Rule<TResult>[] = []) {
    this.load(rules);
  }

  /**
   * Replaces the current rules. All active rules are compiled before the swap, so if any
   * is invalid this throws and the previously loaded rules stay in effect. Inactive rules
   * are skipped entirely, so they are never compiled or evaluated.
   */
  load(rules: Rule<TResult>[]): void {
    this.compiled = rules
      .filter((rule) => rule.active !== false)
      .map((rule) => ({
        test: this.engine.build(rule.criteria) as CompiledRule<TResult>["test"],
        result: rule.result,
      }));
  }

  evaluate(context: TContext): TResult | undefined {
    for (const rule of this.compiled) {
      if (this.engine.truthy(rule.test(context))) return rule.result;
    }
    return undefined;
  }

  get size(): number {
    return this.compiled.length;
  }
}
