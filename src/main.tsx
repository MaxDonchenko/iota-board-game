import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, BrowserRouter, useNavigate } from 'react-router-dom';
import App from './App';

// Use HashRouter for development/localhost, BrowserRouter for production/gh-pages
const useHashRouting =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hash.startsWith('#/');

const Router = useHashRouting ? HashRouter : BrowserRouter;

// Component to handle 404 redirects from GitHub Pages
function RedirectHandler() {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Check if we were redirected from 404.html
    const redirectPath = sessionStorage.getItem('404-redirect-path');
    if (redirectPath) {
      sessionStorage.removeItem('404-redirect-path');
      // Navigate to the original path
      navigate(redirectPath, { replace: true });
    }
  }, [navigate]);

  return null;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router basename={useHashRouting ? undefined : '/iota-board-game'}>
      <RedirectHandler />
      <App />
    </Router>
  </React.StrictMode>
);
