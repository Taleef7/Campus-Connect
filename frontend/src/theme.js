// frontend/src/theme.js
import { createTheme } from '@mui/material/styles';

// Purdue Brand Colors (from marcom.purdue.edu)
const boilermakerGold = '#CFB991';
const black = '#000000';
const steelGray = '#555960'; // Using as secondary
// const steamGray = '#C4BFC0'; // Potential light gray for background?
const defaultBackground = '#F3F2EF'; // Your current light background

export const theme = createTheme({
  palette: {
    primary: {
      main: boilermakerGold,
      contrastText: black, // Black text on Boilermaker Gold
    },
    secondary: {
      main: steelGray, // Using dark gray as secondary
      contrastText: '#ffffff', // White text on dark gray
    },
    background: {
      default: defaultBackground, // Set the main page background color
      paper: '#ffffff', // White background for Paper/Card/AppBar components
    },
    text: {
      primary: steelGray, // Use dark gray for main text (better than pure black)
      secondary: '#6F727B', // A medium gray for less important text
    },
    // You might want to define action colors explicitly later
    // action: {
    //   hover: 'rgba(0, 0, 0, 0.04)' // Default light hover
    // }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', // Default font stack for now
    // Increase boldness/distinction for headings
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 500 },
    button: {
        textTransform: 'none' // Keep button text casing as typed
    }
  },
  shape: {
    borderRadius: 8, // Slightly softer corners than default 4
  },
  components: {
    // Default overrides for specific components (optional)
    MuiAppBar: {
      defaultProps: {
        elevation: 1, // Default shadow for AppBar
        // color: 'paper' // Could set default background color here too
      }
    },
    MuiButton: {
        styleOverrides: {
            // Make contained buttons use primary gold color by default
            // containedPrimary: { // Only applies if color="primary"
            //     color: black, // Ensure contrast text is correct if needed
            // },
            // outlinedSecondary: { // Style outlined secondary buttons
            //     borderColor: steelGray, // Example
            // }
        }
    }
    // Add more overrides as needed (e.g., MuiCard, MuiTab)
  }
});