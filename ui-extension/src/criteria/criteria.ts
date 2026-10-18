import {
  defaultOperators,
  formatQuery,
  type Field,
  type RuleGroupType,
} from "react-querybuilder";
import { parseJsonLogic } from "react-querybuilder/parseJsonLogic";
import type { FieldParam, JsonLogic } from "../types";

const operators = (...names: string[]) =>
  defaultOperators.filter((operator) => names.includes(operator.name));

// Limited to operators that standard JSON Logic engines, like json-logic-engine, support.
const TEXT_OPERATORS = operators("=", "!=", "contains", "in", "notIn");
const CHOICE_OPERATORS = operators("=", "!=", "in", "notIn");
const NUMBER_OPERATORS = operators("=", "!=", "<", "<=", ">", ">=");
const BOOLEAN_OPERATORS = operators("=");

const isListOperator = (operator: string) =>
  operator === "in" || operator === "notIn";

export function toQueryField(param: FieldParam): Field {
  const field = { name: param.name, label: param.label ?? param.name };

  if (param.dataSource) {
    return {
      ...field,
      operators: CHOICE_OPERATORS,
      dataSource: param.dataSource,
    };
  }

  if (param.values) {
    return {
      ...field,
      operators: CHOICE_OPERATORS,
      valueEditorType: (operator) =>
        isListOperator(operator) ? "multiselect" : "select",
      values: param.values.map((value) =>
        typeof value === "string"
          ? { name: value, label: value }
          : { name: value.value, label: value.label },
      ),
    };
  }

  switch (param.type) {
    case "number":
      return { ...field, operators: NUMBER_OPERATORS, inputType: "number" };
    case "boolean":
      return {
        ...field,
        operators: BOOLEAN_OPERATORS,
        valueEditorType: "checkbox",
        defaultValue: true,
      };
    default:
      return { ...field, operators: TEXT_OPERATORS };
  }
}

export function criteriaToQuery(
  criteria: JsonLogic | undefined,
): RuleGroupType {
  if (criteria === undefined || criteria === true) {
    return { combinator: "and", rules: [] };
  }
  return parseJsonLogic(criteria as Parameters<typeof parseJsonLogic>[0]);
}

/** An empty query becomes `true`, so the rule always matches. */
export function queryToCriteria(
  query: RuleGroupType,
  fields: Field[],
): JsonLogic {
  if (query.rules.length === 0) {
    return true;
  }
  return formatQuery(query, {
    format: "jsonlogic",
    fields,
    parseNumbers: "strict-limited",
  }) as JsonLogic;
}

export function describeCriteria(
  criteria: JsonLogic | undefined,
  fields: Field[],
): string {
  const query = criteriaToQuery(criteria);
  if (query.rules.length === 0) {
    return "Always matches";
  }
  return formatQuery(query, { format: "natural_language", fields });
}
