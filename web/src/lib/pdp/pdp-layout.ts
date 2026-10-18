import { after } from "next/server";
import { cache } from "react";
import { getContentByKey, requiredEnv } from "@/lib/amplience/content-client";
import type { Product } from "@/lib/products/products";
import type { Rule } from "@/lib/rules/rule-engine";
import { SwrRuleEngine } from "@/lib/rules/swr-rule-engine";

export type GalleryAspectRatio = "1:1" | "4:5" | "4:3" | "16:9";

/** A `https://example.com/pdp-layout.json` content item, inlined in the rules. */
export interface PdpLayout {
  _meta?: { name?: string; schema?: string; deliveryId?: string };
  themeColor?: string;
  galleryAspectRatio?: GalleryAspectRatio;
}

/** A `https://example.com/pdp-layout-configuration.json` content item. */
interface PdpLayoutConfiguration {
  rules?: Rule<PdpLayout>[];
}

/** The variables the rules can use, matching the `fields` of the rules-array extension. */
export interface PdpRuleContext {
  product: {
    sku: string;
    brand: string;
    category: string;
    price: number;
    onSale: boolean;
  };
}

/** Used when no rule matches, or the rules couldn't be loaded. */
export const fallbackPdpLayout: PdpLayout = {
  _meta: { name: "Built-in fallback" },
  galleryAspectRatio: "1:1",
};

function createPdpLayoutRules() {
  const maxAgeSeconds = Number(
    process.env.PDP_LAYOUT_RULES_MAX_AGE_SECONDS ?? 60,
  );

  return new SwrRuleEngine<PdpLayout, PdpRuleContext>({
    async fetchRules() {
      const config = await getContentByKey<PdpLayoutConfiguration>(
        requiredEnv("PDP_LAYOUT_RULES_KEY"),
      );
      return config.rules ?? [];
    },
    maxAgeMs: maxAgeSeconds * 1000,
    schedule: after,
    onError: (error) =>
      console.error("Failed to refresh the PDP layout rules", error),
  });
}

// One compiled set of rules per server process. It's kept on `globalThis` so every route
// shares it, and so it survives hot reloads in development.
const globalStore = globalThis as typeof globalThis & {
  pdpLayoutRules?: ReturnType<typeof createPdpLayoutRules>;
};

const pdpLayoutRules = (globalStore.pdpLayoutRules ??= createPdpLayoutRules());

export function toRuleContext(product: Product): PdpRuleContext {
  return {
    product: {
      sku: product.sku,
      brand: product.brand,
      category: product.category,
      price: product.price,
      onSale: product.wasPrice !== undefined,
    },
  };
}

/**
 * Chooses the PDP layout for a product with the rules held in memory. Cached per request,
 * so components that need the layout can each call this.
 */
export const getPdpLayout = cache(
  async (product: Product): Promise<PdpLayout> => {
    try {
      return (
        (await pdpLayoutRules.evaluate(toRuleContext(product))) ??
        fallbackPdpLayout
      );
    } catch (error) {
      console.error("Failed to load the PDP layout rules", error);
      return fallbackPdpLayout;
    }
  },
);
