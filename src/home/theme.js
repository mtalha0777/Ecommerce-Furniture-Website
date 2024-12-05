// theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#FFB300", // Main color for primary elements
    },
    secondary: {
      main: "#5D4037", // Main color for secondary elements
    },
    background: {
      default: "#FFF3E0", // Background color for the app
      paper: "#FFF3E0",   // Background color for paper components
    },
    text: {
      primary: "#5D4037", // Primary text color
      secondary: "#000000", // Secondary text color
    },
  },
});

export default theme;
