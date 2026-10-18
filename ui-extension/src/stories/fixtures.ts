import { ContentRelationshipType } from "../schema/contentRelationship";
import type { JSONSchema } from "../schema/types";
import type { FieldParam, Rule } from "../types";
import { contentItems, PDP_LAYOUT_SCHEMA } from "./mockServices";

export const fields: FieldParam[] = [
  {
    name: "product.category",
    label: "Category",
    values: ["t-shirts", "hoodies", "jackets", "shoes", "mugs"],
  },
  { name: "product.brand", label: "Brand", type: "string" },
  { name: "product.price", label: "Price", type: "number" },
  { name: "product.onSale", label: "On sale", type: "boolean" },
  { name: "product.sku", label: "Product", dataSource: "products" },
];

/** As `fields`, but categories come from the hierarchical `categories` data source. */
export const categoryTreeFields: FieldParam[] = fields.map((field) =>
  field.name === "product.category"
    ? { name: field.name, label: field.label, dataSource: "categories" }
    : field,
);

/** The schema of a rules field, as it would appear in a content type. */
export const rulesFieldSchema = (
  result: JSONSchema,
  criteriaFields = fields,
): JSONSchema => ({
  title: "Rules",
  type: "array",
  items: {
    type: "object",
    properties: {
      criteria: { type: ["object", "boolean"] },
      active: { type: "boolean" },
      result,
    },
  },
  "ui:extension": {
    name: "rules-array",
    params: { fields: criteriaFields },
  },
});

const contentRelationshipSchema = (
  type: ContentRelationshipType,
): JSONSchema => ({
  title: "Layout",
  description: "The layout to use when the rule matches.",
  allOf: [
    { $ref: type },
    { properties: { contentType: { enum: [PDP_LAYOUT_SCHEMA] } } },
  ],
});

export const resultSchemas = {
  string: {
    title: "Template",
    description: "The template to render when the rule matches.",
    type: "string",
  },
  enum: {
    title: "Layout",
    type: "string",
    enum: ["default", "apparel", "footwear", "disney"],
  },
  contentLink: contentRelationshipSchema(ContentRelationshipType.CONTENT_LINK),
  contentReference: contentRelationshipSchema(
    ContentRelationshipType.CONTENT_REFERENCE,
  ),
  unsupported: { title: "Priority", type: "number" },
} satisfies Record<string, JSONSchema>;

const criteria = {
  disneyTops: {
    and: [
      { "==": [{ var: "product.brand" }, "Disney"] },
      { in: [{ var: "product.category" }, ["t-shirts", "hoodies"]] },
    ],
  },
  apparel: {
    in: [{ var: "product.category" }, ["t-shirts", "hoodies", "jackets"]],
  },
  featured: { in: [{ var: "product.sku" }, ["SKU-2001", "SKU-3001"]] },
};

export const rulesWith = <T>(
  disney: T,
  apparel: T,
  featured: T,
  fallback: T,
): Rule<T>[] => [
  { criteria: criteria.disneyTops, active: true, result: disney },
  { criteria: criteria.featured, active: false, result: featured },
  { criteria: criteria.apparel, active: true, result: apparel },
  { criteria: true, active: true, result: fallback },
];

export const categoryTreeRules: Rule<string>[] = [
  {
    criteria: {
      in: [{ var: "product.category" }, ["t-shirts", "hoodies", "shirts"]],
    },
    active: true,
    result: "apparel",
  },
  {
    criteria: { "==": [{ var: "product.category" }, "trainers"] },
    active: true,
    result: "footwear",
  },
  { criteria: true, active: true, result: "default" },
];

const link = (index: number, type: ContentRelationshipType) => ({
  _meta: { schema: type },
  id: contentItems[index].id,
  contentType: PDP_LAYOUT_SCHEMA,
});

export const contentRelationshipRules = (type: ContentRelationshipType) =>
  rulesWith(link(2, type), link(1, type), link(3, type), link(0, type));
