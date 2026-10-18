import { ActionIcon, Button, Group, Paper, Stack, Text } from "@mantine/core";
import { IconFileText, IconLink, IconX } from "@tabler/icons-react";
import { useContentItemLabel } from "../../hooks/useContentItemLabel";
import {
  ContentRelationshipType,
  type ContentRelationship,
  type ParsedContentRelationshipSchema,
} from "../../schema/contentRelationship";
import { useEditorServices } from "../../services/EditorServicesContext";

export interface ContentRelationshipInputProps {
  schema: ParsedContentRelationshipSchema;
  value?: ContentRelationship;
  onChange: (value: ContentRelationship | undefined) => void;
  disabled?: boolean;
}

/** A minimal stand-in for Amplience's content link and content reference controls. */
export function ContentRelationshipInput({
  schema,
  value,
  onChange,
  disabled,
}: ContentRelationshipInputProps) {
  const { contentRelationships } = useEditorServices();
  const label = useContentItemLabel(value?.id);
  const kind =
    schema.type === ContentRelationshipType.CONTENT_LINK
      ? "content link"
      : "content reference";

  const pick = async () => {
    const picked = await contentRelationships.pick(schema);
    if (picked) {
      onChange(picked);
    }
  };

  if (!value) {
    return (
      <Button
        variant="default"
        leftSection={<IconLink size={16} />}
        onClick={pick}
        disabled={disabled}
        data-testid="content-relationship:choose"
      >
        Choose {kind}
      </Button>
    );
  }

  return (
    <Paper withBorder p="xs" data-testid="content-relationship:value">
      <Group gap="sm" wrap="nowrap">
        <IconFileText size={20} stroke={1.5} />
        <Stack gap={0} flex={1} miw={0}>
          <Text size="sm" fw={500} truncate>
            {label ?? value.id}
          </Text>
          <Text size="xs" c="dimmed" truncate>
            {value.contentType}
          </Text>
        </Stack>
        <Button variant="subtle" size="xs" onClick={pick} disabled={disabled}>
          Change
        </Button>
        <ActionIcon
          variant="subtle"
          color="gray"
          aria-label={`Clear ${kind}`}
          onClick={() => onChange(undefined)}
          disabled={disabled}
        >
          <IconX size={16} />
        </ActionIcon>
      </Group>
    </Paper>
  );
}
