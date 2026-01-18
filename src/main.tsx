import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { handleGitHubPagesRedirect } from './utils/gh-pages-redirect';

const BASE_PATH = '/iota-board-game';

// Handle GitHub Pages 404 redirect (only in production)
const isLocalhost =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
handleGitHubPagesRedirect(!isLocalhost);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={BASE_PATH}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
