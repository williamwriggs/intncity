import React from 'react';
import ReactDOM from "react-dom/client";
import { StyledEngineProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <App />
    </StyledEngineProvider>
  </React.StrictMode>
);
