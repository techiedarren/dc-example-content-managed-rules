import {
  AspectRatio,
  Breadcrumbs,
  Container,
  Grid,
  GridCol,
  Skeleton,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import type { Metadata } from "next";
import { io } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductPrice } from "@/components/product-price/ProductPrice";
import { getPdpLayout } from "@/lib/pdp/pdp-layout";
import {
  categoryLabels,
  getProduct,
  products,
  type Product,
} from "@/lib/products/products";
import classes from "./page.module.css";
import { PdpLayoutDetails } from "./PdpLayoutDetails";
import { ProductGallery } from "./ProductGallery";
import { ProductOptions } from "./ProductOptions";

export function generateStaticParams() {
  return products.map((product) => ({ sku: product.sku }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[sku]">): Promise<Metadata> {
  const product = getProduct((await params).sku);
  return product
    ? { title: product.name, description: product.description }
    : {};
}

/**
 * The product details are static, so they're prerendered. The parts styled by the PDP
 * layout are rendered on each request, from the rules held in memory.
 */
export default async function ProductPage({ params }: PageProps<"/[sku]">) {
  const product = getProduct((await params).sku);
  if (!product) notFound();

  return (
    <Container size="xl" py="xl">
      <Breadcrumbs mb="lg" fz="sm" c="dimmed">
        <Link href="/" className={classes.crumbLink}>
          Home
        </Link>
        <Text inherit>{categoryLabels[product.category]}</Text>
        <Text inherit c="black">
          {product.name}
        </Text>
      </Breadcrumbs>
      <Grid gap={{ base: "xl", md: 48 }}>
        <GridCol span={{ base: 12, md: 7 }}>
          <Suspense
            fallback={
              <AspectRatio ratio={1}>
                <Skeleton />
              </AspectRatio>
            }
          >
            <LayoutGallery product={product} />
          </Suspense>
        </GridCol>
        <GridCol span={{ base: 12, md: 5 }}>
          <Stack gap="md">
            <Text size="sm" c="dimmed" tt="uppercase">
              {product.brand}
            </Text>
            <Title order={1} size="h2">
              {product.name}
            </Title>
            <ProductPrice product={product} size="lg" />
            <Text>{product.description}</Text>
            <Suspense fallback={<Skeleton h={240} />}>
              <LayoutOptions product={product} />
            </Suspense>
          </Stack>
        </GridCol>
      </Grid>
    </Container>
  );
}

async function LayoutGallery({ product }: { product: Product }) {
  await io();
  const layout = await getPdpLayout(product);
  return (
    <ProductGallery
      image={product.image}
      aspectRatio={layout.galleryAspectRatio}
    />
  );
}

async function LayoutOptions({ product }: { product: Product }) {
  await io();
  const layout = await getPdpLayout(product);
  return (
    <Stack gap="xl" mt="md">
      <ProductOptions sizes={product.sizes} color={layout.themeColor} />
      <PdpLayoutDetails layout={layout} />
    </Stack>
  );
}
