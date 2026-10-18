import { useEffect, useState } from "react";
import { Loader, TreeSelect } from "@mantine/core";
import type { DataSourceTreeNode, TreeDataSource } from "../../services/types";
import { toValues } from "./toValues";

export interface DataSourceTreeSelectProps {
  dataSource: TreeDataSource;
  multiple: boolean;
  value: unknown;
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
  className?: string;
}

function useDataSourceTree(dataSource: TreeDataSource) {
  const [loaded, setLoaded] = useState<{
    dataSource: TreeDataSource;
    tree: DataSourceTreeNode[];
  }>();

  useEffect(() => {
    let cancelled = false;
    void dataSource.getTree().then((tree) => {
      if (!cancelled) {
        setLoaded({ dataSource, tree });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dataSource]);

  return loaded?.dataSource === dataSource ? loaded.tree : undefined;
}

/** Single values must be leaves; checking a parent with `in` selects every leaf beneath it. */
export function DataSourceTreeSelect({
  dataSource,
  multiple,
  value,
  onChange,
  disabled,
  className,
}: DataSourceTreeSelectProps) {
  const tree = useDataSourceTree(dataSource);
  const values = toValues(value);
  const common = {
    className,
    data: tree ?? [],
    disabled,
    searchable: true,
    placeholder: "Choose",
    nothingFoundMessage: tree ? "Nothing found" : "Loading…",
    rightSection: tree ? undefined : <Loader size="xs" />,
  };

  return multiple ? (
    <TreeSelect
      {...common}
      mode="checkbox"
      checkedStrategy="child"
      value={values}
      onChange={onChange}
    />
  ) : (
    <TreeSelect
      {...common}
      // Remount once loaded, as TreeSelect only resolves the label when the value changes
      key={tree ? "loaded" : "loading"}
      expandOnClick
      value={values[0] ?? null}
      onChange={(selected) => onChange(selected ?? "")}
    />
  );
}
