import { useMemo, useState } from "react";
import { Box, Center, Group, Paper, Text } from "@mantine/core";
import { toQueryField } from "../../criteria/criteria";
import { getResultType } from "../../schema/resultType";
import type { JSONSchema } from "../../schema/types";
import type { FieldParam, Rule } from "../../types";
import { RuleDetail } from "../RuleDetail/RuleDetail";
import { RuleTree, type RuleTreeItem } from "../RuleTree/RuleTree";
import styles from "./RulesEditor.module.css";

export interface RulesEditorProps {
  defaultValue?: Rule[];
  onChange?: (rules: Rule[]) => void;
  /** The JSON schema of the rules field. `items.properties.result` decides how results are edited. */
  schema?: JSONSchema;
  /** Variables that criteria can test. */
  fields?: FieldParam[];
  readOnly?: boolean;
}

const toItem = (rule: Rule): RuleTreeItem => ({
  key: crypto.randomUUID(),
  rule,
});

export function RulesEditor({
  defaultValue,
  onChange,
  schema,
  fields: fieldParams,
  readOnly,
}: RulesEditorProps) {
  const [items, setItems] = useState(() => (defaultValue ?? []).map(toItem));
  const [selectedKey, setSelectedKey] = useState(() => items[0]?.key);

  const resultType = useMemo(() => getResultType(schema), [schema]);
  const fields = useMemo(
    () => (fieldParams ?? []).map(toQueryField),
    [fieldParams],
  );

  const update = (next: RuleTreeItem[]) => {
    setItems(next);
    onChange?.(next.map((item) => item.rule));
  };

  const add = () => {
    const item = toItem({ criteria: true, active: true });
    update([...items, item]);
    setSelectedKey(item.key);
  };

  const remove = (key: string) => {
    const index = items.findIndex((item) => item.key === key);
    const next = items.filter((item) => item.key !== key);
    update(next);
    if (key === selectedKey) {
      setSelectedKey(next[Math.min(index, next.length - 1)]?.key);
    }
  };

  const move = (key: string, toIndex: number) => {
    const item = items.find((candidate) => candidate.key === key);
    if (!item) {
      return;
    }
    const next = items.filter((candidate) => candidate.key !== key);
    next.splice(toIndex, 0, item);
    update(next);
  };

  const updateRule = (key: string, rule: Rule) =>
    update(items.map((item) => (item.key === key ? { key, rule } : item)));

  const selectedIndex = items.findIndex((item) => item.key === selectedKey);
  const selected = items[selectedIndex];

  return (
    <Group
      align="stretch"
      wrap="nowrap"
      gap="md"
      className={styles.root}
      data-testid="rules-editor:root"
    >
      <Paper withBorder w={300} className={styles.tree}>
        <RuleTree
          items={items}
          selectedKey={selectedKey}
          onSelect={setSelectedKey}
          onAdd={add}
          onRemove={remove}
          onMove={move}
          resultType={resultType}
          fields={fields}
          readOnly={readOnly}
        />
      </Paper>

      <Paper withBorder flex={1} miw={0}>
        {selected ? (
          <RuleDetail
            key={selected.key}
            index={selectedIndex}
            rule={selected.rule}
            onChange={(rule) => updateRule(selected.key, rule)}
            resultType={resultType}
            fields={fields}
            readOnly={readOnly}
          />
        ) : (
          <Center h="100%" p="xl">
            <Box ta="center">
              <Text fw={500}>No rule selected</Text>
              <Text size="sm" c="dimmed">
                Select a rule from the list, or add a new one.
              </Text>
            </Box>
          </Center>
        )}
      </Paper>
    </Group>
  );
}
