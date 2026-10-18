import { useState, type CSSProperties, type DragEvent } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Menu,
  Stack,
  Text,
  Tree,
  type RenderTreeNodePayload,
} from "@mantine/core";
import {
  IconArrowDown,
  IconArrowUp,
  IconDots,
  IconGripVertical,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import clsx from "clsx";
import type { Field } from "react-querybuilder";
import { describeCriteria } from "../../criteria/criteria";
import { useResultLabel } from "../../hooks/useResultLabel";
import type { ResultType } from "../../schema/resultType";
import type { Rule } from "../../types";
import styles from "./RuleTree.module.css";

export interface RuleTreeItem {
  key: string;
  rule: Rule;
}

export interface RuleTreeProps {
  items: RuleTreeItem[];
  selectedKey?: string;
  onSelect: (key: string) => void;
  onAdd: () => void;
  onRemove: (key: string) => void;
  onMove: (key: string, toIndex: number) => void;
  resultType: ResultType;
  fields: Field[];
  readOnly?: boolean;
}

type DropPosition = "before" | "after";

/** Lists the rules in the order they're checked, with selection and reordering. */
export function RuleTree({
  items,
  selectedKey,
  onSelect,
  onAdd,
  onRemove,
  onMove,
  resultType,
  fields,
  readOnly,
}: RuleTreeProps) {
  const [dragKey, setDragKey] = useState<string>();
  const [drop, setDrop] = useState<{ key: string; position: DropPosition }>();

  const endDrag = () => {
    setDragKey(undefined);
    setDrop(undefined);
  };

  const handleDrop = (targetKey: string, position: DropPosition) => {
    if (dragKey && dragKey !== targetKey) {
      const from = items.findIndex((item) => item.key === dragKey);
      const target = items.findIndex((item) => item.key === targetKey);
      const to = target + (position === "after" ? 1 : 0);
      onMove(dragKey, from < to ? to - 1 : to);
    }
    endDrag();
  };

  const renderNode = ({ node, elementProps }: RenderTreeNodePayload) => {
    const index = items.findIndex((item) => item.key === node.value);
    const item = items[index];
    return (
      <RuleTreeRow
        className={elementProps.className}
        style={elementProps.style}
        index={index}
        count={items.length}
        rule={item.rule}
        selected={item.key === selectedKey}
        dragging={item.key === dragKey}
        dropPosition={drop?.key === item.key ? drop.position : undefined}
        resultType={resultType}
        fields={fields}
        readOnly={readOnly}
        onSelect={() => onSelect(item.key)}
        onRemove={() => onRemove(item.key)}
        onMove={(toIndex) => onMove(item.key, toIndex)}
        onDragStart={() => setDragKey(item.key)}
        onDragOver={(position) => setDrop({ key: item.key, position })}
        onDrop={(position) => handleDrop(item.key, position)}
        onDragEnd={endDrag}
      />
    );
  };

  return (
    <Stack gap={0} h="100%" data-testid="rule-tree:root">
      <Group justify="space-between" p="xs" className={styles.header}>
        <Text size="sm" fw={600}>
          Rules
        </Text>
        <Button
          size="xs"
          variant="subtle"
          leftSection={<IconPlus size={14} />}
          onClick={onAdd}
          disabled={readOnly}
          data-testid="rule-tree:add"
        >
          Add rule
        </Button>
      </Group>

      <Box p={4} flex={1}>
        {items.length === 0 ? (
          <Text size="sm" c="dimmed" p="sm" ta="center">
            No rules yet. Add a rule to get started.
          </Text>
        ) : (
          <Tree
            data={items.map((item) => ({ value: item.key, label: item.key }))}
            renderNode={renderNode}
            selectOnClick={false}
            expandOnClick={false}
            levelOffset={0}
          />
        )}
      </Box>

      <Text size="xs" c="dimmed" p="xs" className={styles.footer}>
        Rules are checked from top to bottom. The first active match wins.
      </Text>
    </Stack>
  );
}

interface RuleTreeRowProps {
  className: string;
  style: CSSProperties;
  index: number;
  count: number;
  rule: Rule;
  selected: boolean;
  dragging: boolean;
  dropPosition?: DropPosition;
  resultType: ResultType;
  fields: Field[];
  readOnly?: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onMove: (toIndex: number) => void;
  onDragStart: () => void;
  onDragOver: (position: DropPosition) => void;
  onDrop: (position: DropPosition) => void;
  onDragEnd: () => void;
}

const dropPositionOf = (event: DragEvent<HTMLElement>): DropPosition => {
  const { top, height } = event.currentTarget.getBoundingClientRect();
  return event.clientY < top + height / 2 ? "before" : "after";
};

function RuleTreeRow({
  className,
  style,
  index,
  count,
  rule,
  selected,
  dragging,
  dropPosition,
  resultType,
  fields,
  readOnly,
  onSelect,
  onRemove,
  onMove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: RuleTreeRowProps) {
  const resultLabel = useResultLabel(resultType, rule.result);
  const inactive = rule.active === false;

  return (
    <Group
      gap={4}
      wrap="nowrap"
      className={clsx(className, styles.row)}
      style={style}
      data-selected={selected || undefined}
      data-inactive={inactive || undefined}
      data-dragging={dragging || undefined}
      data-drop={dropPosition}
      data-testid="rule-tree:row"
      onClick={onSelect}
      draggable={!readOnly}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver(dropPositionOf(event));
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(dropPositionOf(event));
      }}
      onDragEnd={onDragEnd}
    >
      {!readOnly && (
        <IconGripVertical size={14} className={styles.grip} aria-hidden />
      )}
      <Text size="xs" c="dimmed" w={18} ta="right">
        {index + 1}
      </Text>
      <Stack gap={0} flex={1} miw={0} py={4} pl={4}>
        <Group gap={6} wrap="nowrap">
          <Text
            size="sm"
            fw={500}
            truncate
            c={resultLabel ? undefined : "dimmed"}
          >
            {resultLabel ?? "No result"}
          </Text>
          {inactive && (
            <Badge size="xs" color="gray" variant="light">
              Inactive
            </Badge>
          )}
        </Group>
        <Text size="xs" c="dimmed" lineClamp={2}>
          {describeCriteria(rule.criteria, fields)}
        </Text>
      </Stack>

      {!readOnly && (
        // Menu clicks bubble through the portal to the row, so stop them here.
        <Box onClick={(event) => event.stopPropagation()}>
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                aria-label={`Actions for rule ${index + 1}`}
                className={styles.actions}
              >
                <IconDots size={14} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconArrowUp size={14} />}
                disabled={index === 0}
                onClick={() => onMove(index - 1)}
              >
                Move up
              </Menu.Item>
              <Menu.Item
                leftSection={<IconArrowDown size={14} />}
                disabled={index === count - 1}
                onClick={() => onMove(index + 1)}
              >
                Move down
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                onClick={onRemove}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Box>
      )}
    </Group>
  );
}
