import { useEffect, useState } from "react";
import {
  Loader,
  MultiSelect,
  Select,
  Text,
  type OptionsFilter,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import type { ValueEditorProps } from "react-querybuilder";
import { useEditorServices } from "../../services/EditorServicesContext";
import type { DataSourceOption, SearchDataSource } from "../../services/types";
import { DataSourceTreeSelect } from "./DataSourceTreeSelect";
import { toValues } from "./toValues";

// The data source has already filtered the options.
const passThrough: OptionsFilter = ({ options }) => options;

/** Searches a data source as the author types, and keeps labels for the chosen values. */
function useDataSourceOptions(dataSource: SearchDataSource, values: string[]) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 250);
  const [results, setResults] = useState<{
    search: string;
    options: DataSourceOption[];
  }>();
  const [known, setKnown] = useState<Record<string, DataSourceOption>>({});

  const remember = (options: DataSourceOption[]) =>
    setKnown((current) => ({
      ...current,
      ...Object.fromEntries(options.map((option) => [option.value, option])),
    }));

  useEffect(() => {
    let cancelled = false;
    void dataSource.search(debouncedSearch).then((options) => {
      if (!cancelled) {
        setResults({ search: debouncedSearch, options });
        remember(options);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dataSource, debouncedSearch]);

  const valuesKey = values.join(",");
  useEffect(() => {
    if (valuesKey) {
      void dataSource.getOptions(valuesKey.split(",")).then(remember);
    }
  }, [dataSource, valuesKey]);

  const loading = results?.search !== search;
  const selected = values.map(
    (value) => known[value] ?? { value, label: value },
  );
  const data = [
    ...selected,
    ...(results?.options ?? []).filter(
      (option) => !values.includes(option.value),
    ),
  ];

  return { data, loading, setSearch };
}

export function DataSourceValueEditor({
  value,
  handleOnChange,
  operator,
  fieldData,
  disabled,
  className,
}: ValueEditorProps) {
  const { dataSources } = useEditorServices();
  const dataSourceId = String(fieldData.dataSource);
  const dataSource = dataSources[dataSourceId];

  if (!dataSource) {
    return (
      <Text size="sm" c="red">
        Unknown data source "{dataSourceId}"
      </Text>
    );
  }

  const selectProps = {
    multiple: operator === "in" || operator === "notIn",
    value,
    onChange: handleOnChange,
    disabled,
    className,
  };

  if (dataSource.type === "tree") {
    return <DataSourceTreeSelect dataSource={dataSource} {...selectProps} />;
  }

  return <DataSourceSelect dataSource={dataSource} {...selectProps} />;
}

interface DataSourceSelectProps {
  dataSource: SearchDataSource;
  multiple: boolean;
  value: unknown;
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
  className?: string;
}

function DataSourceSelect({
  dataSource,
  multiple,
  value,
  onChange,
  disabled,
  className,
}: DataSourceSelectProps) {
  const values = toValues(value);
  const { data, loading, setSearch } = useDataSourceOptions(dataSource, values);
  const common = {
    className,
    data,
    disabled,
    searchable: true,
    filter: passThrough,
    onSearchChange: setSearch,
    placeholder: "Search",
    rightSection: loading ? <Loader size="xs" /> : undefined,
    nothingFoundMessage: loading ? "Searching…" : "Nothing found",
  };

  return multiple ? (
    <MultiSelect {...common} value={values} onChange={onChange} />
  ) : (
    <Select
      {...common}
      value={values[0] ?? null}
      onChange={(selected) => onChange(selected ?? "")}
    />
  );
}
