import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ContentRelationshipType } from "../../schema/contentRelationship";
import {
  categoryTreeFields,
  categoryTreeRules,
  contentRelationshipRules,
  fields,
  resultSchemas,
  rulesFieldSchema,
  rulesWith,
} from "../../stories/fixtures";
import { RulesEditor } from "./RulesEditor";

const meta = {
  title: "RulesEditor",
  component: RulesEditor,
  args: { fields, onChange: fn() },
} satisfies Meta<typeof RulesEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StringResult: Story = {
  args: {
    schema: rulesFieldSchema(resultSchemas.string),
    defaultValue: rulesWith(
      "pdp-disney",
      "pdp-apparel",
      "pdp-featured",
      "pdp-default",
    ),
  },
};

export const EnumResult: Story = {
  args: {
    schema: rulesFieldSchema(resultSchemas.enum),
    defaultValue: rulesWith("disney", "apparel", "footwear", "default"),
  },
};

/** Categories come from a hierarchical data source, picked with a tree select. */
export const CategoryTree: Story = {
  args: {
    schema: rulesFieldSchema(resultSchemas.enum, categoryTreeFields),
    fields: categoryTreeFields,
    defaultValue: categoryTreeRules,
  },
};

export const ContentLinkResult: Story = {
  args: {
    schema: rulesFieldSchema(resultSchemas.contentLink),
    defaultValue: contentRelationshipRules(
      ContentRelationshipType.CONTENT_LINK,
    ),
  },
};

export const ContentReferenceResult: Story = {
  args: {
    schema: rulesFieldSchema(resultSchemas.contentReference),
    defaultValue: contentRelationshipRules(
      ContentRelationshipType.CONTENT_REFERENCE,
    ),
  },
};

export const UnsupportedResult: Story = {
  args: {
    schema: rulesFieldSchema(resultSchemas.unsupported),
    defaultValue: rulesWith(1, 2, 3, 4),
  },
};

export const Empty: Story = {
  args: { schema: rulesFieldSchema(resultSchemas.contentLink) },
};

export const NoFields: Story = {
  args: {
    schema: rulesFieldSchema(resultSchemas.string),
    fields: [],
    defaultValue: [{ criteria: true, active: true }],
  },
};

export const ReadOnly: Story = {
  args: { ...ContentLinkResult.args, readOnly: true },
};
