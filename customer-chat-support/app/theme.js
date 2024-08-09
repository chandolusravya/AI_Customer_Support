"use client";

import { createTheme, responsiveFontSizes } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "Inter, sans-serif",
  },
  palette: {
    background: {
      main: "#FFFFFF",
    },
    primary: {
      main: "#000000",
    },
    secondary: {
      main: "#F2F2F2",
    },
    tertiary: {
      main: "#2B8EAA",
    },
    dark: { main: "#333333" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 40,
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: 10,
        },
      },
    },
  },
});

export default responsiveFontSizes(theme);
