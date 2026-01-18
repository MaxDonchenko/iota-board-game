/**
 * Handles GitHub Pages 404 redirect on sub-routes
 * GitHub Pages serves 404.html for non-existent routes, which redirects with ?p= parameter
 * This function restores the original URL so React Router can handle it
 */
export function handleGitHubPagesRedirect(shouldRedirect: boolean): void {
  if (window.location.search.startsWith('?p=') && shouldRedirect) {
    const redirectPath = window.location.search.substring(3);
    window.history.replaceState(null, '', '/iota-board-game/' + redirectPath);
  }
}
