import { Group, Text } from "@mantine/core";
import { formatPrice, type Product } from "@/lib/products/products";

export function ProductPrice({
  product,
  size,
}: {
  product: Product;
  size?: string;
}) {
  if (product.wasPrice === undefined) {
    return (
      <Text size={size} fw={500}>
        {formatPrice(product.price)}
      </Text>
    );
  }

  return (
    <Group gap="xs">
      <Text size={size} fw={500} c="red.8">
        {formatPrice(product.price)}
      </Text>
      <Text size={size} c="dimmed" td="line-through">
        {formatPrice(product.wasPrice)}
      </Text>
    </Group>
  );
}
