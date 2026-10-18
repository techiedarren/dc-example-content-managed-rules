import type { DataSourceOption, SearchDataSource } from "../services/types";

// Stand-in catalogue, matching the example products in the web app. Replace `search` and
// `getOptions` with calls to your PIM.
const products: DataSourceOption[] = [
  {
    value: "SKU-1001",
    label: "Mickey Pumpkin Patch Tee",
    description: "Disney · t-shirts",
  },
  {
    value: "SKU-2001",
    label: "Essential Crew Tee",
    description: "ANYA FINN · t-shirts",
  },
  {
    value: "SKU-2002",
    label: "Everyday Zip Hoodie",
    description: "ANYA FINN · hoodies",
  },
  {
    value: "SKU-2003",
    label: "Classic Oxford Shirt",
    description: "ANYA FINN · shirts",
  },
  {
    value: "SKU-3001",
    label: "Cord Collar Denim Jacket",
    description: "ANYA FINN · jackets",
  },
  {
    value: "SKU-3002",
    label: "Belted Wool-Blend Coat",
    description: "ANYA FINN · coats",
  },
  {
    value: "SKU-3004",
    label: "Leather Chelsea Boots",
    description: "ANYA FINN · boots",
  },
  {
    value: "SKU-4001",
    label: "Stoneware Mug Set",
    description: "ANYA FINN · mugs",
  },
  {
    value: "SKU-4002",
    label: "Linen Cushion Cover",
    description: "ANYA FINN · cushions",
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const productDataSource: SearchDataSource = {
  type: "search",
  async search(query) {
    await delay(200);
    const text = query.trim().toLowerCase();
    return products.filter(
      (product) =>
        product.label.toLowerCase().includes(text) ||
        product.value.toLowerCase().includes(text),
    );
  },
  async getOptions(values) {
    await delay(100);
    return products.filter((product) => values.includes(product.value));
  },
};
