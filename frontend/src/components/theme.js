import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0B0F19",
      paper: "#1E1E1E",
    },
    primary: {
      main: "#90caf9",   // Light blue highlight
    },
    secondary: {
      main: "#f48fb1",   // Pink accent
    },
    text: {
      primary: "#C9D1D9",
      secondary: "#B0B0B0",
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#0B0F19",
          borderRadius: 12,
          padding: "20px",
        }
      }
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#1F2937",
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        hover: {
          "&:hover": {
            backgroundColor: "#333333",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          textTransform: "none",
          fontWeight: 600,
        }
      }
    }
  }
});

export default theme;
