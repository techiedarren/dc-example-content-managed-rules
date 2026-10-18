import { Badge, Box, Text } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import { ProductPrice } from "@/components/product-price/ProductPrice";
import type { Product } from "@/lib/products/products";
import classes from "./ProductCard.module.css";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/${product.sku}`} className={classes.card}>
      <Box pos="relative" className={classes.image}>
        <Image
          src={product.image.src}
          alt={product.image.alt}
          fill
          sizes="(min-width: 75em) 25vw, (min-width: 48em) 33vw, 50vw"
        />
        {product.wasPrice !== undefined && (
          <Badge color="red.8" pos="absolute" top={12} left={12}>
            Sale
          </Badge>
        )}
      </Box>
      <Text size="xs" c="dimmed" tt="uppercase" mt="sm">
        {product.brand}
      </Text>
      <Text fw={500}>{product.name}</Text>
      <ProductPrice product={product} size="sm" />
    </Link>
  );
}
