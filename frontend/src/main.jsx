// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles'; // Import ThemeProvider
import { GoogleOAuthProvider } from '@react-oauth/google';

import App from './App';
import { theme } from './theme'; // Import your custom theme
import './index.css';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Apply ThemeProvider and CssBaseline here */}
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalizes styles and applies background color */}
      <BrowserRouter>
        <GoogleOAuthProvider clientId={CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);