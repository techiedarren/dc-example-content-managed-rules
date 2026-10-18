import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { getResultType } from "../../schema/resultType";
import { resultSchemas, rulesFieldSchema } from "../../stories/fixtures";
import { ResultInput, type ResultInputProps } from "./ResultInput";

const resultTypeOf = (
  schema: (typeof resultSchemas)[keyof typeof resultSchemas],
) => getResultType(rulesFieldSchema(schema));

function StatefulResultInput({ value, onChange, ...props }: ResultInputProps) {
  const [current, setCurrent] = useState(value);
  return (
    <ResultInput
      {...props}
      value={current}
      onChange={(next) => {
        setCurrent(next);
        onChange(next);
      }}
    />
  );
}

const meta = {
  title: "ResultInput",
  component: ResultInput,
  render: (args) => <StatefulResultInput {...args} />,
  args: { onChange: fn(), value: undefined },
} satisfies Meta<typeof ResultInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {
    resultType: resultTypeOf(resultSchemas.string),
    value: "pdp-default",
  },
};

export const Enum: Story = {
  args: { resultType: resultTypeOf(resultSchemas.enum), value: "apparel" },
};

export const ContentLink: Story = {
  args: { resultType: resultTypeOf(resultSchemas.contentLink) },
};

export const ContentReference: Story = {
  args: { resultType: resultTypeOf(resultSchemas.contentReference) },
};

export const Unsupported: Story = {
  args: { resultType: resultTypeOf(resultSchemas.unsupported) },
};
