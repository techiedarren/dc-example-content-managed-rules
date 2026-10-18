import { Anchor, Box, Text } from "@mantine/core";
import Image from "next/image";
import type { GalleryAspectRatio } from "@/lib/pdp/pdp-layout";
import type { ProductImage } from "@/lib/products/products";
import classes from "./ProductGallery.module.css";

function toRatio(aspectRatio: GalleryAspectRatio = "1:1"): number {
  const [width, height] = aspectRatio.split(":").map(Number);
  return width / height;
}

export function ProductGallery({
  image,
  aspectRatio,
}: {
  image: ProductImage;
  aspectRatio?: GalleryAspectRatio;
}) {
  return (
    <figure className={classes.figure}>
      <Box
        pos="relative"
        className={classes.image}
        style={{ aspectRatio: toRatio(aspectRatio) }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          preload
          sizes="(min-width: 62em) 58vw, 100vw"
        />
      </Box>
      <Text component="figcaption" size="xs" c="dimmed" mt="xs">
        Photo by{" "}
        <Anchor
          href={`https://unsplash.com/@${image.credit.username}`}
          inherit
          c="dimmed"
        >
          {image.credit.name}
        </Anchor>{" "}
        on{" "}
        <Anchor href={image.credit.photoUrl} inherit c="dimmed">
          Unsplash
        </Anchor>
      </Text>
    </figure>
  );
}
