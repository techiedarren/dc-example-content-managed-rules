import { describe, expect, it, vi } from "vitest";
import type { Rule } from "./rule-engine";
import { SwrRuleEngine } from "./swr-rule-engine";

const always = (result: string): Rule<string>[] => [{ criteria: true, result }];

/** A fetcher whose responses are resolved or rejected by the test. */
function controlledFetcher() {
  const pending: {
    resolve: (rules: Rule<string>[]) => void;
    reject: (error: unknown) => void;
  }[] = [];
  const fetchRules = vi.fn(
    () =>
      new Promise<Rule<string>[]>((resolve, reject) => {
        pending.push({ resolve, reject });
      }),
  );
  return { fetchRules, pending };
}

function setup() {
  const { fetchRules, pending } = controlledFetcher();
  let time = 0;
  const tasks: (() => Promise<void>)[] = [];
  const onError = vi.fn();
  const engine = new SwrRuleEngine<string>({
    fetchRules,
    maxAgeMs: 1000,
    now: () => time,
    schedule: (task) => tasks.push(task),
    onError,
  });
  return {
    engine,
    fetchRules,
    pending,
    tasks,
    onError,
    advance: (ms: number) => (time += ms),
    runTasks: () => Promise.all(tasks.splice(0).map((task) => task())),
  };
}

describe("SwrRuleEngine", () => {
  it("waits for the rules on the first call", async () => {
    const { engine, pending } = setup();

    const result = engine.evaluate({});
    pending[0].resolve(always("first"));

    await expect(result).resolves.toBe("first");
  });

  it("shares one request between concurrent first calls", async () => {
    const { engine, fetchRules, pending } = setup();

    const results = Promise.all([engine.evaluate({}), engine.evaluate({})]);
    pending[0].resolve(always("first"));

    await expect(results).resolves.toEqual(["first", "first"]);
    expect(fetchRules).toHaveBeenCalledTimes(1);
  });

  it("serves fresh rules from memory without fetching", async () => {
    const { engine, fetchRules, pending, tasks, advance } = setup();
    const first = engine.evaluate({});
    pending[0].resolve(always("first"));
    await first;

    advance(999);

    await expect(engine.evaluate({})).resolves.toBe("first");
    expect(fetchRules).toHaveBeenCalledTimes(1);
    expect(tasks).toHaveLength(0);
  });

  it("serves stale rules and refreshes them in the background", async () => {
    const { engine, fetchRules, pending, advance, runTasks } = setup();
    const first = engine.evaluate({});
    pending[0].resolve(always("first"));
    await first;

    advance(1000);

    await expect(engine.evaluate({})).resolves.toBe("first");
    const refresh = runTasks();
    pending[1].resolve(always("second"));
    await refresh;

    await expect(engine.evaluate({})).resolves.toBe("second");
    expect(fetchRules).toHaveBeenCalledTimes(2);
  });

  it("starts one background refresh for many stale calls", async () => {
    const { engine, fetchRules, pending, advance, runTasks } = setup();
    const first = engine.evaluate({});
    pending[0].resolve(always("first"));
    await first;

    advance(1000);
    await Promise.all([
      engine.evaluate({}),
      engine.evaluate({}),
      engine.evaluate({}),
    ]);
    const refresh = runTasks();
    pending[1].resolve(always("second"));
    await refresh;

    expect(fetchRules).toHaveBeenCalledTimes(2);
  });

  it("keeps the previous rules when a refresh fails, and waits before retrying", async () => {
    const { engine, fetchRules, pending, tasks, onError, advance, runTasks } =
      setup();
    const first = engine.evaluate({});
    pending[0].resolve(always("first"));
    await first;

    advance(1000);
    await engine.evaluate({});
    const refresh = runTasks();
    const error = new Error("CMS unavailable");
    pending[1].reject(error);
    await refresh;

    expect(onError).toHaveBeenCalledWith(error);
    await expect(engine.evaluate({})).resolves.toBe("first");
    expect(tasks).toHaveLength(0);
    expect(fetchRules).toHaveBeenCalledTimes(2);
  });

  it("keeps the previous rules when the new rules don't compile", async () => {
    const { engine, pending, onError, advance, runTasks } = setup();
    const first = engine.evaluate({});
    pending[0].resolve(always("first"));
    await first;

    advance(1000);
    await engine.evaluate({});
    const refresh = runTasks();
    pending[1].resolve([{ criteria: { notAnOperator: [] }, result: "second" }]);
    await refresh;

    expect(onError).toHaveBeenCalled();
    await expect(engine.evaluate({})).resolves.toBe("first");
  });

  it("rejects when the first load fails, then retries on the next call", async () => {
    const { engine, fetchRules, pending } = setup();

    const first = engine.evaluate({});
    pending[0].reject(new Error("CMS unavailable"));
    await expect(first).rejects.toThrow("CMS unavailable");

    const second = engine.evaluate({});
    pending[1].resolve(always("second"));
    await expect(second).resolves.toBe("second");
    expect(fetchRules).toHaveBeenCalledTimes(2);
  });
});
