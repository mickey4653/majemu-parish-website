import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#123456", // Replace with the primary blue shade from your Figma
      contrastText: "#FFFFFF", // For buttons/text on the primary color
    },
    secondary: {
      main: "#654321", // Replace with secondary color (e.g., accent or highlight)
    },
     gradient: {
      yellowLight: "linear-gradient(180deg, #F3E6BE 0%, #FFC20A 100%)", // Example gradient
	    whiteGrey: "linear-gradient(180deg, rgba(0, 0, 0, 0.04) 0%, rgba(251, 251, 251, 0.79) 100%)",
			whiteGrey2: "linear-gradient(180deg, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0) 100%), #F9FBFB",
	    blueDark: "linear-gradient(180deg, #063386 0%, #1D6AA6 100%)",
	    blueLight: "linear-gradient(180deg, #063386 0%, #1B62E4 100%)",
    },
    background: {
      default: "#F5F5F5", // Background color of the pages
      paper: "#FFFFFF", // Background for cards, modals, etc.
    },
    text: {
      primary: "#000000", // Primary text color
      secondary: "#757575", // Secondary text color (e.g., subtitles or descriptions)
    },
  },
  typography: {
    fontFamily: [
      "Roboto", // Replace with your font choice (e.g., Montserrat, Roboto)
      "sans-serif",
    ].join(","),
    h1: {
      fontSize: "2.5rem", // Adjust to match header sizes
      fontWeight: 700, // Bold header
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
    },
    body1: {
      fontSize: "1rem",
      color: "#333333", // For body text
    },
    button: {
      textTransform: "none", // Disable uppercase transformation
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px", // Rounded buttons
          padding: "10px 20px", // Adjust button padding
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px", // Match card design from Figma
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
  breakpoints: {
    values: {
      mobileSmall: 320,
      mobileSmallPlus: 360,
      mobile: 576.5,
      tablet: 767.5,
      laptop: 1024,
      desktop: 1280,
      desktopMedium: 1440,
      desktopLarge: 1536,
      desktopExtraLarge: 1921,
    },
},
});

export default theme;
