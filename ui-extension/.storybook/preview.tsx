import type { Preview } from "@storybook/react-vite";
import { Box, MantineProvider } from "@mantine/core";
import { EditorServicesContext } from "../src/services/EditorServicesContext";
import { mockServices } from "../src/stories/mockServices";
import { theme } from "../src/theme";
import "../src/global.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <MantineProvider theme={theme}>
        <EditorServicesContext value={mockServices}>
          <Box p="md">
            <Story />
          </Box>
        </EditorServicesContext>
      </MantineProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
};

export default preview;
