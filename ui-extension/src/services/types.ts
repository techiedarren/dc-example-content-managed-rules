import type {
  ContentRelationship,
  ParsedContentRelationshipSchema,
} from "../schema/contentRelationship";

export interface DataSourceOption {
  value: string;
  label: string;
  description?: string;
}

/** Values that are searched as the author types, e.g. products from a PIM. */
export interface SearchDataSource {
  type: "search";
  /** Find options matching what the author has typed. */
  search(query: string): Promise<DataSourceOption[]>;
  /** Resolve options for values already saved in a rule, so they show their labels. */
  getOptions(values: string[]): Promise<DataSourceOption[]>;
}

export interface DataSourceTreeNode {
  value: string;
  label: string;
  children?: DataSourceTreeNode[];
}

/** Hierarchical values that are loaded up front, e.g. product categories. */
export interface TreeDataSource {
  type: "tree";
  getTree(): Promise<DataSourceTreeNode[]>;
}

/** Dynamic values for a criteria field. */
export type DataSource = SearchDataSource | TreeDataSource;

export interface ContentRelationshipService {
  /** Let the author choose a content item. Resolves `undefined` if they cancel. */
  pick(
    schema: ParsedContentRelationshipSchema,
  ): Promise<ContentRelationship | undefined>;
  getLabel(id: string): Promise<string | undefined>;
}

export interface EditorServices {
  dataSources: Record<string, DataSource>;
  contentRelationships: ContentRelationshipService;
}
