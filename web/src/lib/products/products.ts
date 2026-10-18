/** Leaf categories, matching the `categories` data source in the UI extension. */
export type Category =
  | "t-shirts"
  | "hoodies"
  | "shirts"
  | "jackets"
  | "coats"
  | "trainers"
  | "boots"
  | "mugs"
  | "cushions";

export const categoryLabels: Record<Category, string> = {
  "t-shirts": "T-shirts",
  hoodies: "Hoodies",
  shirts: "Shirts",
  jackets: "Jackets",
  coats: "Coats",
  trainers: "Trainers",
  boots: "Boots",
  mugs: "Mugs",
  cushions: "Cushions",
};

export interface ProductImage {
  /** An `images.unsplash.com` URL, resized by the Unsplash image loader. */
  src: string;
  alt: string;
  credit: { name: string; username: string; photoUrl: string };
}

export interface Product {
  sku: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  /** The original price, when the product is on sale. */
  wasPrice?: number;
  description: string;
  sizes: string[];
  image: ProductImage;
}

const clothingSizes = ["XS", "S", "M", "L", "XL"];

function unsplash(
  photo: string,
  slug: string,
  alt: string,
  name: string,
  username: string,
): ProductImage {
  return {
    src: `https://images.unsplash.com/photo-${photo}`,
    alt,
    credit: { name, username, photoUrl: `https://unsplash.com/photos/${slug}` },
  };
}

/**
 * Stand-in catalogue, chosen to exercise each PDP layout rule. The SKUs match the
 * `products` data source in the UI extension. Replace with calls to your PIM.
 */
export const products: Product[] = [
  {
    sku: "SKU-1001",
    name: "Mickey Pumpkin Patch Tee",
    brand: "Disney",
    category: "t-shirts",
    price: 29.95,
    description:
      "A soft cotton tee with an embroidered Mickey Mouse pumpkin patch, ready for autumn.",
    sizes: clothingSizes,
    image: unsplash(
      "1709200446956-9cda52d8333f",
      "-xIzRBra8cc",
      "Embroidered Mickey Mouse pumpkin patch",
      "Stitch Patches",
      "stitchpatches",
    ),
  },
  {
    sku: "SKU-2001",
    name: "Essential Crew Tee",
    brand: "ANYA FINN",
    category: "t-shirts",
    price: 14.95,
    description: "Our everyday crew neck tee in heavyweight organic cotton.",
    sizes: clothingSizes,
    image: unsplash(
      "1778671394516-8270eac13c42",
      "8ACmRoleM24",
      "Plain white t-shirt on a wooden hanger",
      "Avtar Singh",
      "avtar9w",
    ),
  },
  {
    sku: "SKU-2002",
    name: "Everyday Zip Hoodie",
    brand: "ANYA FINN",
    category: "hoodies",
    price: 34.95,
    wasPrice: 44.95,
    description: "A brushed-back fleece zip hoodie in heather grey.",
    sizes: clothingSizes,
    image: unsplash(
      "1742392133846-a8b416e81661",
      "VXEca6MPGKk",
      "Grey hoodie hanging on a door",
      "Anastasiia Polishchuk",
      "polishuchka",
    ),
  },
  {
    sku: "SKU-2003",
    name: "Classic Oxford Shirt",
    brand: "ANYA FINN",
    category: "shirts",
    price: 39.95,
    description: "A crisp cotton oxford shirt with a button-down collar.",
    sizes: clothingSizes,
    image: unsplash(
      "1603252109303-2751441dd157",
      "hMMXhKSZk7k",
      "White button-up shirts on hangers",
      "Nimble Made",
      "nimblemade",
    ),
  },
  {
    sku: "SKU-3001",
    name: "Cord Collar Denim Jacket",
    brand: "ANYA FINN",
    category: "jackets",
    price: 89.95,
    description: "A mid-wash trucker jacket with a corduroy collar.",
    sizes: clothingSizes,
    image: unsplash(
      "1611312449408-fcece27cdbb7",
      "QRN47la37gw",
      "Denim trucker jacket with a corduroy collar",
      "Caio Coelho",
      "smokthebikini",
    ),
  },
  {
    sku: "SKU-3002",
    name: "Belted Wool-Blend Coat",
    brand: "ANYA FINN",
    category: "coats",
    price: 149.95,
    description: "A long camel coat in a soft wool blend, with a tie belt.",
    sizes: clothingSizes,
    image: unsplash(
      "1539533113208-f6df8cc8b543",
      "zkHv9pvrE9U",
      "Woman wearing a belted camel coat",
      "Bundo Kim",
      "bundo",
    ),
  },
  {
    sku: "SKU-3004",
    name: "Leather Chelsea Boots",
    brand: "ANYA FINN",
    category: "boots",
    price: 119.95,
    wasPrice: 139.95,
    description:
      "Brown leather Chelsea boots with elastic sides and a pull tab.",
    sizes: ["6", "7", "8", "9", "10", "11"],
    image: unsplash(
      "1777987601677-3059be0e1388",
      "AwhukWqsfSs",
      "Brown leather Chelsea boots",
      "Husien Bisky",
      "husien_bisky1",
    ),
  },
  {
    sku: "SKU-4001",
    name: "Stoneware Mug Set",
    brand: "ANYA FINN",
    category: "mugs",
    price: 24.95,
    description: "A set of two speckled stoneware mugs with a cream glaze.",
    sizes: ["Set of 2"],
    image: unsplash(
      "1687158179204-5849fb8fc8a5",
      "3OhHwUBWKKM",
      "Cream stoneware mugs",
      "sareh Askarzadeh",
      "sareh102",
    ),
  },
  {
    sku: "SKU-4002",
    name: "Linen Cushion Cover",
    brand: "ANYA FINN",
    category: "cushions",
    price: 19.95,
    wasPrice: 29.95,
    description: "A washed linen cushion cover in rust and natural tones.",
    sizes: ['18" x 18"', '20" x 20"'],
    image: unsplash(
      "1611489704434-2612dc89c992",
      "jerLmkgxQhA",
      "Linen cushions in rust and natural tones",
      "Veronika Martinelli",
      "veronikamartinelli",
    ),
  },
];

export function getProduct(sku: string): Product | undefined {
  return products.find((product) => product.sku === sku);
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatPrice(price: number): string {
  return currency.format(price);
}
