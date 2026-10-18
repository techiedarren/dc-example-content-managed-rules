import { Container, SimpleGrid, Text, Title } from "@mantine/core";
import { ProductCard } from "@/components/product-card/ProductCard";
import { products } from "@/lib/products/products";

export default function Home() {
  return (
    <Container size="xl" py="xl">
      <Title order={1}>New arrivals</Title>
      <Text c="dimmed" mt="xs" mb="xl">
        Open a product to see the PDP layout the rules in the CMS choose for it.
      </Text>
      <SimpleGrid
        cols={{ base: 2, sm: 3, lg: 4 }}
        spacing="lg"
        verticalSpacing="xl"
      >
        {products.map((product) => (
          <ProductCard key={product.sku} product={product} />
        ))}
      </SimpleGrid>
    </Container>
  );
}
