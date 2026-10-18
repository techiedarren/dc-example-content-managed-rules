/** Reads a query builder value, which may be an array or a comma-separated string. */
export const toValues = (value: unknown): string[] =>
  (Array.isArray(value) ? value : String(value ?? "").split(","))
    .map((item) => String(item).trim())
    .filter(Boolean);
