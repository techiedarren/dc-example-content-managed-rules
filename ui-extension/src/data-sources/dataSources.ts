import type { DataSource } from "../services/types";
import { categoryDataSource } from "./categoryDataSource";
import { productDataSource } from "./productDataSource";

/** Data sources that criteria fields can reference by id with `"dataSource"` in the params. */
export const dataSources: Record<string, DataSource> = {
  products: productDataSource,
  categories: categoryDataSource,
};
