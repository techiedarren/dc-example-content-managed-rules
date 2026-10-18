import { ColorSwatch, Group, Paper, Stack, Text } from "@mantine/core";
import type { PdpLayout } from "@/lib/pdp/pdp-layout";

/** Shows which layout the rules chose, to make the demo easy to follow. */
export function PdpLayoutDetails({ layout }: { layout: PdpLayout }) {
  return (
    <Paper withBorder p="md" bg="gray.0">
      <Stack gap={6}>
        <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
          Layout chosen by the rules
        </Text>
        <Text fw={600}>{layout._meta?.name ?? "Unnamed layout"}</Text>
        <Group gap="xs">
          <Text size="sm">Theme color:</Text>
          {layout.themeColor ? (
            <>
              <ColorSwatch color={layout.themeColor} size={16} />
              <Text size="sm" ff="monospace">
                {layout.themeColor}
              </Text>
            </>
          ) : (
            <Text size="sm" c="dimmed">
              Store default
            </Text>
          )}
        </Group>
        <Text size="sm">
          Gallery aspect ratio: {layout.galleryAspectRatio ?? "1:1"}
        </Text>
      </Stack>
    </Paper>
  );
}
