import { Group, Stack, Switch, Text, Title } from "@mantine/core";
import type { Field } from "react-querybuilder";
import type { ResultType } from "../../schema/resultType";
import type { Rule } from "../../types";
import { CriteriaBuilder } from "../CriteriaBuilder/CriteriaBuilder";
import { ResultInput } from "../ResultInput/ResultInput";

export interface RuleDetailProps {
  index: number;
  rule: Rule;
  onChange: (rule: Rule) => void;
  resultType: ResultType;
  fields: Field[];
  readOnly?: boolean;
}

export function RuleDetail({
  index,
  rule,
  onChange,
  resultType,
  fields,
  readOnly,
}: RuleDetailProps) {
  return (
    <Stack gap="lg" p="md" data-testid="rule-detail:root">
      <Group justify="space-between">
        <Title order={4}>Rule {index + 1}</Title>
        <Switch
          label="Active"
          checked={rule.active !== false}
          onChange={(event) =>
            onChange({ ...rule, active: event.currentTarget.checked })
          }
          disabled={readOnly}
        />
      </Group>

      <Stack gap="xs">
        <div>
          <Text size="sm" fw={500}>
            Criteria
          </Text>
          <Text size="xs" c="dimmed">
            With no conditions, the rule always matches.
          </Text>
        </div>
        <CriteriaBuilder
          criteria={rule.criteria}
          fields={fields}
          onChange={(criteria) => onChange({ ...rule, criteria })}
          disabled={readOnly}
        />
      </Stack>

      <ResultInput
        resultType={resultType}
        value={rule.result}
        onChange={(result) => onChange({ ...rule, result })}
        disabled={readOnly}
      />
    </Stack>
  );
}
