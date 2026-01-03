import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, BrowserRouter } from 'react-router-dom';
import App from './App';
import { handleGitHubPagesRedirect } from './utils/gh-pages-redirect';

// Use HashRouter for development/localhost, BrowserRouter for production/gh-pages
const useHashRouting =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hash.startsWith('#/');

const Router = useHashRouting ? HashRouter : BrowserRouter;

// Handle GitHub Pages 404 redirect
handleGitHubPagesRedirect(useHashRouting);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router basename={useHashRouting ? undefined : '/iota-board-game'}>
      <App />
    </Router>
  </React.StrictMode>
);
