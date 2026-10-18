import { createTheme, type MantineColorsTuple } from "@mantine/core";

// Approximates the Amplience design system, which is built on Mantine.
const primary: MantineColorsTuple = [
  "#f2f8fd",
  "#e6f1fc",
  "#d9eafa",
  "#b3d5f5",
  "#81baee",
  "#5ba5e9",
  "#3590e4",
  "#0374dd",
  "#0068c9",
  "#005ab2",
];

export const theme = createTheme({
  colors: { primary },
  primaryColor: "primary",
  primaryShade: 7,
  black: "#002c42",
  fontFamily: "IBM Plex Sans, sans-serif",
  headings: { fontFamily: "IBM Plex Sans, sans-serif" },
  defaultRadius: "xs",
});
