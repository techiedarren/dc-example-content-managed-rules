import { RuleEngine, type Rule } from "./rule-engine";

export interface SwrRuleEngineOptions<TResult> {
  /** Fetches the latest rules, e.g. from a CMS content item. */
  fetchRules: () => Promise<Rule<TResult>[]>;
  /** How long loaded rules are fresh, in milliseconds. */
  maxAgeMs: number;
  /**
   * Runs a background refresh. Defaults to starting it straight away. In Next.js, pass
   * `after` so the refresh runs once the response has been sent.
   */
  schedule?: (task: () => Promise<void>) => void;
  /** Called when a background refresh fails. The previous rules stay in effect. */
  onError?: (error: unknown) => void;
  now?: () => number;
}

/**
 * Keeps a compiled `RuleEngine` in memory and refreshes it with stale-while-revalidate:
 *
 * - The first call waits for the rules to load.
 * - Later calls return the compiled rules straight away. Once they are older than
 *   `maxAgeMs`, a single refresh is started in the background.
 * - If a refresh fails, or the new rules don't compile, the previous rules are kept and
 *   the next attempt waits for another `maxAgeMs`.
 */
export class SwrRuleEngine<TResult, TContext = unknown> {
  private readonly engine = new RuleEngine<TResult, TContext>();
  private loaded = false;
  private checkedAt = 0;
  private refreshing: Promise<void> | undefined;

  constructor(private readonly options: SwrRuleEngineOptions<TResult>) {}

  /** Returns the compiled rules, loading them first if this is the first call. */
  async get(): Promise<RuleEngine<TResult, TContext>> {
    if (!this.loaded) {
      await this.refresh();
    } else if (this.isStale()) {
      const { schedule = (task) => void task(), onError = console.error } =
        this.options;
      schedule(() =>
        (this.isStale() ? this.refresh() : Promise.resolve()).catch(onError),
      );
    }
    return this.engine;
  }

  async evaluate(context: TContext): Promise<TResult | undefined> {
    return (await this.get()).evaluate(context);
  }

  /** Fetches and compiles the rules now. Concurrent calls share one request. */
  refresh(): Promise<void> {
    this.refreshing ??= this.load().finally(() => {
      this.refreshing = undefined;
    });
    return this.refreshing;
  }

  private async load(): Promise<void> {
    try {
      this.engine.load(await this.options.fetchRules());
      this.loaded = true;
    } finally {
      this.checkedAt = this.now();
    }
  }

  private isStale(): boolean {
    return (
      this.refreshing === undefined &&
      this.now() - this.checkedAt >= this.options.maxAgeMs
    );
  }

  private now(): number {
    return (this.options.now ?? Date.now)();
  }
}
