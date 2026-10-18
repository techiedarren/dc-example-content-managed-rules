import { Alert, Box, Input, Select, TextInput } from "@mantine/core";
import { isContentRelationship } from "../../schema/contentRelationship";
import type { ResultType } from "../../schema/resultType";
import { ContentRelationshipInput } from "../ContentRelationshipInput/ContentRelationshipInput";

export interface ResultInputProps {
  resultType: ResultType;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
}

/** Edits a rule's result with a control that matches the result schema. */
export function ResultInput({
  resultType,
  value,
  onChange,
  disabled,
}: ResultInputProps) {
  const label = resultType.schema.title ?? "Result";
  const description = resultType.schema.description;

  switch (resultType.kind) {
    case "string":
      return (
        <TextInput
          label={label}
          description={description}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.currentTarget.value || undefined)}
          disabled={disabled}
        />
      );
    case "enum":
      return (
        <Select
          label={label}
          description={description}
          data={resultType.options}
          value={typeof value === "string" ? value : null}
          onChange={(selected) => onChange(selected ?? undefined)}
          placeholder="Choose a value"
          clearable
          disabled={disabled}
        />
      );
    case "content-relationship":
      return (
        <Input.Wrapper label={label} description={description}>
          <Box mt={4}>
            <ContentRelationshipInput
              schema={resultType.relationship}
              value={isContentRelationship(value) ? value : undefined}
              onChange={onChange}
              disabled={disabled}
            />
          </Box>
        </Input.Wrapper>
      );
    case "unsupported":
      return (
        <Alert color="orange" title={`${label} can't be edited`}>
          {resultType.reason}
        </Alert>
      );
  }
}
