# Rules Array UI Extension

An Amplience content field extension for editing an ordered list of rules. Each rule pairs **criteria** with a **result**, such as the PDP layout to show for a product. Criteria are saved as [JSON Logic](https://jsonlogic.com/), so the web app's [Rule Engine](../README.md#rule-engine) evaluates them directly.

Authors see a rule tree on the left, in evaluation order, and the selected rule on the right. On the right they can:

- turn the rule on or off
- build its criteria with [React Query Builder](https://react-querybuilder.js.org/)
- choose its result

It is built with React 19, Vite, [Mantine 9](https://mantine.dev/) and the [dc-extensions-sdk](https://github.com/amplience/dc-extensions-sdk).

## Running locally

Requires Node.js 26. Install from the repository root, which is an npm workspace:

```bash
nvm use
npm install
```

Run these scripts from this folder, or from the root with `-w ui-extension`:

| Command                   | Description                                                            |
| ------------------------- | ---------------------------------------------------------------------- |
| `npm run storybook`       | Storybook at http://localhost:6006. The easiest way to work on the UI. |
| `npm run dev`             | Vite dev server at http://localhost:5173, to load in Amplience.        |
| `npm run build`           | Type-check and build to `dist/`.                                       |
| `npm run preview`         | Serve the `dist/` build.                                               |
| `npm test`                | Unit tests (Vitest).                                                   |
| `npm run lint`            | Lint (oxlint).                                                         |
| `npm run build-storybook` | Build Storybook to `storybook-static/`.                                |

The extension needs Amplience to run. Opened directly, it shows a "Not connected to Amplience" message. Storybook stories replace the SDK with mock services, so you can work on the UI without the CMS.

## Using it in Amplience

### 1. Host the extension

- **Development:** run `npm run dev` and use `http://localhost:5173`. Amplience is served over HTTPS. Most browsers allow an `http://localhost` frame inside an HTTPS page, but if yours blocks it, serve the dev server over HTTPS.
- **Production:** run `npm run build` and host `dist/` on any static HTTPS host, such as AWS Amplify, S3 + CloudFront, Vercel or Netlify.

### 2. Register the extension

In Amplience, go to **Development › Extensions** and register an extension:

| Setting                       | Value                                                                                           |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| Category                      | Content field                                                                                   |
| Label                         | Rules array                                                                                     |
| Name                          | `rules-array`. Schemas use this name to refer to the extension.                                 |
| URL                           | The URL from step 1.                                                                            |
| Permissions › API permissions | **Read access**. Lets the extension show the names of linked content items, not just their ids. |
| Installation parameters       | Optional. Use these to share [`fields`](#parameters) between content types.                     |

### 3. Use it in a content type schema

Add an array field whose items have `criteria`, `active` and `result` properties, and point its `ui:extension` at the extension:

```json
{
  "rules": {
    "title": "Rules",
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "criteria": { "type": ["object", "boolean"] },
        "active": { "type": "boolean" },
        "result": {
          "title": "Layout",
          "type": "string",
          "enum": ["standard", "apparel", "footwear"]
        }
      }
    },
    "ui:extension": {
      "name": "rules-array",
      "params": {
        "fields": [
          {
            "name": "product.category",
            "label": "Category",
            "dataSource": "categories"
          },
          { "name": "product.brand", "label": "Brand" },
          { "name": "product.price", "label": "Price", "type": "number" },
          { "name": "product.onSale", "label": "On sale", "type": "boolean" },
          {
            "name": "product.sku",
            "label": "Product",
            "dataSource": "products"
          }
        ]
      }
    }
  }
}
```

`criteria` must allow `boolean` as well as `object`, because a rule with no conditions is saved as `true`.

The extension saves the field as an array of rules, in order:

```json
[
  {
    "criteria": {
      "in": [{ "var": "product.category" }, ["t-shirts", "hoodies"]]
    },
    "active": true,
    "result": "apparel"
  },
  { "criteria": true, "active": true, "result": "standard" }
]
```

The web app evaluates the active rules in order. The first rule whose criteria match its context decides the result. See the [root README](../README.md#rule-engine).

## Parameters

### `fields`

`fields` lists the variables authors can use in criteria. Set it in the schema's `ui:extension.params` (instance parameters) or in the extension's installation parameters. When both are set, the instance parameters win.

Each field is read from the rule engine's context with `{ "var": name }`.

| Property     | Required | Description                                                                                   |
| ------------ | -------- | --------------------------------------------------------------------------------------------- |
| `name`       | Yes      | Path in the context, e.g. `product.brand`.                                                    |
| `label`      | No       | Shown to authors. Defaults to `name`.                                                         |
| `type`       | No       | `string` (default), `number` or `boolean`. Sets the operators and input.                      |
| `values`     | No       | A fixed list of choices, as strings or `{ "value", "label" }` objects. Shown as a select.     |
| `dataSource` | No       | The id of a [data source](#data-sources) to choose values from. Takes priority over `values`. |

The operators are the ones the web Rule Engine supports:

| Field                 | Operators                             | Input                                        |
| --------------------- | ------------------------------------- | -------------------------------------------- |
| `string`              | `=`, `!=`, `contains`, `in`, `not in` | Text box                                     |
| `number`              | `=`, `!=`, `<`, `<=`, `>`, `>=`       | Number input                                 |
| `boolean`             | `=`                                   | Checkbox                                     |
| `values`              | `=`, `!=`, `in`, `not in`             | Select, or multi-select for `in` / `not in`  |
| `dataSource` (search) | `=`, `!=`, `in`, `not in`             | Searchable select or multi-select            |
| `dataSource` (tree)   | `=`, `!=`, `in`, `not in`             | Tree select. Checkboxes for `in` / `not in`. |

### Result schema

The input for a rule's result depends on the schema at `items.properties.result`:

| Result schema                                  | Input                                                      |
| ---------------------------------------------- | ---------------------------------------------------------- |
| `"type": "string"`                             | Text box                                                   |
| `"type": "string"` with an `enum`              | Select                                                     |
| Content link (`content-link` `$ref`)           | Button that opens the content browser, then shows the item |
| Content reference (`content-reference` `$ref`) | As above                                                   |

Content links and references are limited to the content types in the schema's `contentType` `enum`. Other result types show a message saying they aren't supported.

## Data sources

Data sources supply criteria values that live in another system, such as products or categories in a PIM. They are registered in code, in [src/data-sources/dataSources.ts](src/data-sources/dataSources.ts). Fields refer to them by id with `"dataSource"`.

| Id           | Kind   | Source                                                                           |
| ------------ | ------ | -------------------------------------------------------------------------------- |
| `products`   | Search | [productDataSource.ts](src/data-sources/productDataSource.ts), mock SKUs         |
| `categories` | Tree   | [categoryDataSource.ts](src/data-sources/categoryDataSource.ts), mock categories |

Both are **mocks** for the example. Replace them with calls to your PIM.

- **Search** data sources are for long, flat lists. Authors type to search them, and saved values are resolved back to labels with `getOptions`.
- **Tree** data sources are for hierarchies. The whole tree loads once and is shown in a Mantine `TreeSelect`. Only leaves are saved:
  - With `=` or `!=`, authors pick a single leaf.
  - With `in` or `not in`, checking a parent selects every leaf beneath it.
  - So the web app's context must give each product its leaf category.

Criteria store option **values**, such as a SKU, never labels. The web app's context must provide the same values.

## Implementation

```text
src/
├── main.tsx                 Connects to Amplience with the SDK, then renders App
├── App.tsx                  Reads params, schema and value from the SDK; saves changes
├── types.ts                 Rule, FieldParam and ExtensionParams
├── extension/
│   └── sdkServices.ts       Content picker and item labels, backed by the SDK
├── services/                EditorServices interfaces and React context
├── data-sources/            Data sources, registered by id
├── criteria/criteria.ts     Fields → React Query Builder fields; JSON Logic ⇄ queries
├── schema/                  Reads the result schema (ports of Amplience utilities)
├── components/
│   ├── RulesEditor/         Tree + detail layout, and the list of rules
│   ├── RuleTree/            Ordered, draggable list of rules
│   ├── RuleDetail/          Active switch, criteria and result for one rule
│   ├── CriteriaBuilder/     React Query Builder with Mantine controls
│   ├── DataSourceValueEditor/  Value inputs for data source fields
│   ├── ResultInput/         Result input chosen from the result schema
│   └── ContentRelationshipInput/  Content link and reference picker
├── hooks/                   Labels for results and content items
└── stories/                 Storybook fixtures and mock services
```

- **SDK at the edge.** Only [main.tsx](src/main.tsx), [App.tsx](src/App.tsx) and [sdkServices.ts](src/extension/sdkServices.ts) use the SDK.
  - Components get data sources and the content picker through `EditorServicesContext`. Storybook swaps in [mockServices.ts](src/stories/mockServices.ts) there.
  - `main.tsx` connects outside React, so `StrictMode` doesn't open two SDK connections.
- **Criteria.** [criteria.ts](src/criteria/criteria.ts) handles the criteria:
  - It converts each `fields` entry to a React Query Builder field and limits it to operators that standard JSON Logic supports.
  - Queries are converted to and from JSON Logic with React Query Builder's `parseJsonLogic` and `formatQuery`.
  - An empty query is saved as `true`.
  - The summaries in the rule tree use its `natural_language` format.
- **Results.** [resultType.ts](src/schema/resultType.ts) reads `items.properties.result` and returns a `ResultType`, a union with a `kind`. [ResultInput.tsx](src/components/ResultInput/ResultInput.tsx) switches on `kind` to pick the input.
- **Saving.** Every change calls `sdk.field.setValue`. Amplience shows validation errors itself. When the content item is read-only, the editor is disabled.

## Extending

### Add a data source

1. Implement `SearchDataSource` or `TreeDataSource` from [services/types.ts](src/services/types.ts):

   ```ts
   // src/data-sources/brandDataSource.ts
   import type { SearchDataSource } from "../services/types";

   const PIM_URL = "https://pim.example.com";

   const toOptions = (brands: { id: string; name: string }[]) =>
     brands.map((brand) => ({ value: brand.id, label: brand.name }));

   export const brandDataSource: SearchDataSource = {
     type: "search",
     async search(query) {
       const response = await fetch(
         `${PIM_URL}/brands?q=${encodeURIComponent(query)}`,
       );
       return toOptions(await response.json());
     },
     async getOptions(values) {
       const ids = values.map(encodeURIComponent).join(",");
       const response = await fetch(`${PIM_URL}/brands?ids=${ids}`);
       return toOptions(await response.json());
     },
   };
   ```

   A tree data source only needs `getTree()`, which returns `{ value, label, children? }` nodes.

2. Register it in [dataSources.ts](src/data-sources/dataSources.ts):

   ```ts
   export const dataSources: Record<string, DataSource> = {
     products: productDataSource,
     categories: categoryDataSource,
     brands: brandDataSource,
   };
   ```

3. Use it in a field: `{ "name": "product.brand", "label": "Brand", "dataSource": "brands" }`.

The extension calls data sources from the browser, so the API must allow CORS from the extension's origin. Don't put secrets in the extension. Put a backend in front of APIs that need them. Storybook uses the same `dataSources`, so a new data source shows up in the stories.

### Add a kind of data source

To show a data source with a different control, such as a date range or a map:

1. Add an interface with a new `type` to the `DataSource` union in [services/types.ts](src/services/types.ts).
2. Add a component next to [DataSourceTreeSelect.tsx](src/components/DataSourceValueEditor/DataSourceTreeSelect.tsx).
3. Render it for that `type` in [DataSourceValueEditor.tsx](src/components/DataSourceValueEditor/DataSourceValueEditor.tsx).
4. Use `toValues` to read the value, since it may be an array or a comma-separated string. Call `onChange` with a string, or with a string array for `in` / `not in`.

### Add a field type

To add a criteria `type` beyond `string`, `number` and `boolean`:

1. Add it to `FieldParam["type"]` in [types.ts](src/types.ts).
2. Add a case to `toQueryField` in [criteria.ts](src/criteria/criteria.ts) that sets the operators, and the `inputType` or `valueEditorType`.
   - Only use operators the web [Rule Engine](../README.md#rule-engine) can evaluate.
   - Check the JSON Logic that `formatQuery` produces for them.
3. For a custom input, branch on the field in the value editor in [CriteriaBuilder.tsx](src/components/CriteriaBuilder/CriteriaBuilder.tsx), where data source fields are handled.
4. Add a round-trip test to [criteria.test.ts](src/criteria/criteria.test.ts).

### Add a result type

To support another result schema, such as a `number` or `boolean`:

1. Add a `kind` to `ResultType` in [resultType.ts](src/schema/resultType.ts), and detect it in `getResultType`. `inferSchemaType` gives the schema's type.
2. Add a case to [ResultInput.tsx](src/components/ResultInput/ResultInput.tsx). TypeScript reports the switch as incomplete until you do.
3. Update [useResultLabel.ts](src/hooks/useResultLabel.ts) so the rule tree can show the result. It only shows strings and content items today.
4. Add a test to [resultType.test.ts](src/schema/resultType.test.ts), and a schema to `resultSchemas` in [fixtures.ts](src/stories/fixtures.ts) with a story.

## Storybook and tests

Stories sit next to their components, and their fixtures are in [src/stories/fixtures.ts](src/stories/fixtures.ts). They cover:

- each result type
- both data sources
- categories as a fixed list and as a tree
- read-only, empty and no-fields states

Unit tests cover the JSON Logic conversion and reading result schemas.
