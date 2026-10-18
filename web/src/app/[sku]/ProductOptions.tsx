"use client";

import { Button, Group, Stack, Text } from "@mantine/core";
import { useState } from "react";

/** Size picker and bag buttons. `color` is the layout's theme colour, if it sets one. */
export function ProductOptions({
  sizes,
  color,
}: {
  sizes: string[];
  color?: string;
}) {
  const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : undefined);
  const [added, setAdded] = useState(false);

  return (
    <Stack gap="lg">
      <div>
        <Text size="sm" fw={500} mb="xs">
          Size{size && `: ${size}`}
        </Text>
        <Group gap="xs">
          {sizes.map((option) => (
            <Button
              key={option}
              color={color}
              variant={option === size ? "filled" : "default"}
              miw={56}
              aria-pressed={option === size}
              onClick={() => {
                setSize(option);
                setAdded(false);
              }}
            >
              {option}
            </Button>
          ))}
        </Group>
      </div>
      <Stack gap="xs">
        <Button
          color={color}
          size="lg"
          fullWidth
          disabled={!size}
          onClick={() => setAdded(true)}
        >
          {added ? "Added to bag" : size ? "Add to bag" : "Select a size"}
        </Button>
        <Button color={color} variant="outline" size="lg" fullWidth>
          Add to favorites
        </Button>
      </Stack>
    </Stack>
  );
}
