import type { DataSourceTreeNode, TreeDataSource } from "../services/types";

// Stand-in category tree. Replace `getTree` with a call to your PIM.
const categories: DataSourceTreeNode[] = [
  {
    value: "clothing",
    label: "Clothing",
    children: [
      {
        value: "tops",
        label: "Tops",
        children: [
          { value: "t-shirts", label: "T-shirts" },
          { value: "hoodies", label: "Hoodies" },
          { value: "shirts", label: "Shirts" },
        ],
      },
      {
        value: "outerwear",
        label: "Outerwear",
        children: [
          { value: "jackets", label: "Jackets" },
          { value: "coats", label: "Coats" },
        ],
      },
    ],
  },
  {
    value: "footwear",
    label: "Footwear",
    children: [
      { value: "trainers", label: "Trainers" },
      { value: "boots", label: "Boots" },
    ],
  },
  {
    value: "home",
    label: "Home",
    children: [
      { value: "mugs", label: "Mugs" },
      { value: "cushions", label: "Cushions" },
    ],
  },
];

export const categoryDataSource: TreeDataSource = {
  type: "tree",
  async getTree() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return categories;
  },
};
