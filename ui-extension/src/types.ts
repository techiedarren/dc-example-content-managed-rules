/** A JSON Logic expression. `true` always matches. */
export type JsonLogic = Record<string, unknown> | boolean;

/** A rule as stored in the CMS content item. Matches the web app's `Rule`. */
export interface Rule<TResult = unknown> {
  criteria: JsonLogic;
  result?: TResult;
  active?: boolean;
}

/**
 * A variable authors can use in criteria, configured in the `ui:extension` params.
 * `name` is the path read from the context the rules are evaluated against.
 */
export interface FieldParam {
  name: string;
  label?: string;
  type?: "string" | "number" | "boolean";
  values?: (string | { value: string; label: string })[];
  /** Id of a data source registered in the extension, e.g. a PIM product lookup. */
  dataSource?: string;
}

export interface ExtensionParams {
  fields?: FieldParam[];
}
