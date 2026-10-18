import { useState } from "react";
import { Alert, Box, Code } from "@mantine/core";
import {
  MantineActionElement,
  MantineValueEditor,
  QueryBuilderMantine,
} from "@react-querybuilder/mantine";
import { IconX } from "@tabler/icons-react";
import {
  QueryBuilder,
  type ActionProps,
  type Controls,
  type Field,
  type FullField,
  type RuleGroupType,
  type ValueEditorProps,
} from "react-querybuilder";
import { criteriaToQuery, queryToCriteria } from "../../criteria/criteria";
import type { JsonLogic } from "../../types";
import { DataSourceValueEditor } from "../DataSourceValueEditor/DataSourceValueEditor";
import styles from "./CriteriaBuilder.module.css";

function CriteriaValueEditor(props: ValueEditorProps) {
  return props.fieldData.dataSource ? (
    <DataSourceValueEditor {...props} />
  ) : (
    <MantineValueEditor {...props} />
  );
}

const AddAction = (props: ActionProps) => (
  <MantineActionElement {...props} variant="light" size="xs" />
);

const RemoveAction = (props: ActionProps) => (
  <MantineActionElement {...props} variant="subtle" color="gray" size="xs" />
);

const controlElements: Partial<Controls<FullField, string>> = {
  valueEditor: CriteriaValueEditor,
  addRuleAction: AddAction,
  addGroupAction: AddAction,
  removeRuleAction: RemoveAction,
  removeGroupAction: RemoveAction,
};

const translations = {
  addRule: { label: "Add condition", title: "Add condition" },
  addGroup: { label: "Add group", title: "Add group" },
  removeRule: { label: <IconX size={14} />, title: "Remove condition" },
  removeGroup: { label: <IconX size={14} />, title: "Remove group" },
};

export interface CriteriaBuilderProps {
  criteria: JsonLogic | undefined;
  fields: Field[];
  onChange: (criteria: JsonLogic) => void;
  disabled?: boolean;
}

/** Edits a rule's JSON Logic criteria with React Query Builder. */
export function CriteriaBuilder({
  criteria,
  fields,
  onChange,
  disabled,
}: CriteriaBuilderProps) {
  const [query, setQuery] = useState(() => criteriaToQuery(criteria));

  const handleQueryChange = (next: RuleGroupType) => {
    setQuery(next);
    onChange(queryToCriteria(next, fields));
  };

  if (fields.length === 0) {
    return (
      <Alert color="orange" title="No criteria fields">
        Add <Code>fields</Code> to the extension params to build criteria.
      </Alert>
    );
  }

  return (
    <Box className={styles.root}>
      <QueryBuilderMantine>
        <QueryBuilder
          fields={fields}
          query={query}
          onQueryChange={handleQueryChange}
          controlElements={controlElements}
          translations={translations}
          enableMountQueryChange={false}
          disabled={disabled}
        />
      </QueryBuilderMantine>
    </Box>
  );
}
