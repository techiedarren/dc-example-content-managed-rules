import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Code, Stack } from "@mantine/core";
import { fn } from "storybook/test";
import { toQueryField } from "../../criteria/criteria";
import { categoryTreeFields, fields } from "../../stories/fixtures";
import type { JsonLogic } from "../../types";
import { CriteriaBuilder, type CriteriaBuilderProps } from "./CriteriaBuilder";

/** Shows the JSON Logic that's saved alongside the builder. */
function CriteriaBuilderWithOutput({
  criteria,
  onChange,
  ...props
}: CriteriaBuilderProps) {
  const [current, setCurrent] = useState<JsonLogic | undefined>(criteria);
  return (
    <Stack>
      <CriteriaBuilder
        {...props}
        criteria={criteria}
        onChange={(next) => {
          setCurrent(next);
          onChange(next);
        }}
      />
      <Code block>{JSON.stringify(current ?? true, null, 2)}</Code>
    </Stack>
  );
}

const meta = {
  title: "CriteriaBuilder",
  component: CriteriaBuilder,
  render: (args) => <CriteriaBuilderWithOutput {...args} />,
  args: {
    criteria: true,
    fields: fields.map(toQueryField),
    onChange: fn(),
  },
} satisfies Meta<typeof CriteriaBuilder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const WithCriteria: Story = {
  args: {
    criteria: {
      and: [
        { "==": [{ var: "product.brand" }, "Disney"] },
        { in: [{ var: "product.category" }, ["t-shirts", "hoodies"]] },
        { ">": [{ var: "product.price" }, 20] },
      ],
    },
  },
};

export const ProductLookup: Story = {
  args: {
    criteria: { in: [{ var: "product.sku" }, ["SKU-1001", "SKU-2001"]] },
  },
};

/** Categories as a fixed list in the extension params. */
export const CategoryEnum: Story = {
  args: {
    criteria: { in: [{ var: "product.category" }, ["t-shirts", "hoodies"]] },
  },
};

/** Categories from a hierarchical data source. Checking a parent selects all its leaves. */
export const CategoryTree: Story = {
  args: {
    fields: categoryTreeFields.map(toQueryField),
    criteria: {
      or: [
        {
          in: [{ var: "product.category" }, ["t-shirts", "hoodies", "shirts"]],
        },
        { "==": [{ var: "product.category" }, "trainers"] },
      ],
    },
  },
};

export const Disabled: Story = {
  args: { ...WithCriteria.args, disabled: true },
};
