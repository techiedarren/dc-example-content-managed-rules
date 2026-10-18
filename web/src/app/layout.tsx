import "@mantine/core/styles.css";

import {
  Box,
  ColorSchemeScript,
  Container,
  Group,
  MantineProvider,
  Text,
  mantineHtmlProps,
} from "@mantine/core";
import type { Metadata } from "next";
import Link from "next/link";
import classes from "./layout.module.css";
import { theme } from "./theme";

export const metadata: Metadata = {
  title: { default: "Example Store", template: "%s | Example Store" },
  description:
    "An example store whose product pages are laid out by rules managed in the CMS.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <Box component="header" className={classes.header}>
            <Container size="xl">
              <Group h={64} justify="space-between">
                <Link href="/" className={classes.logo}>
                  Example Store
                </Link>
                <Text size="sm" c="dimmed">
                  Content managed rules demo
                </Text>
              </Group>
            </Container>
          </Box>
          <main>{children}</main>
        </MantineProvider>
      </body>
    </html>
  );
}
