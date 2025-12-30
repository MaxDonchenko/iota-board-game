/**
 * Routing service for managing navigation and URL parameters
 * Centralizes route handling to avoid duplication and ensure consistency
 * Supports both hash routing (for development) and regular routing (for gh-pages)
 */

const BASE_PATH = '/iota-board-game/';

export class RoutingService {
  /**
   * Check if we should use hash routing (development) or regular routing (gh-pages)
   */
  private static useHashRouting(): boolean {
    // Use hash routing if we're on localhost or if hash routing is already in use
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hash.startsWith('#/')
    );
  }

  /**
   * Get the base path for regular routing (gh-pages)
   */
  private static getBasePath(): string {
    return this.useHashRouting() ? '' : BASE_PATH;
  }

  /**
   * Get the current pathname (hash route or regular route)
   */
  static getPathname(): string {
    if (this.useHashRouting()) {
      return window.location.hash.replace('#', '') || '/';
    }
    // Regular routing - remove base path
    const path = window.location.pathname;
    return path.startsWith(BASE_PATH) ? path.slice(BASE_PATH.length - 1) || '/' : path || '/';
  }

  /**
   * Get game ID from URL query parameters
   */
  static getGameIdFromUrl(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('game');
  }

  /**
   * Set game ID in URL query parameters
   */
  static setGameIdInUrl(gameId: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set('game', gameId);
    window.history.replaceState({}, '', url.toString());
  }

  /**
   * Remove game ID from URL query parameters
   */
  static removeGameIdFromUrl(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('game');
    window.history.replaceState({}, '', url.toString());
  }

  /**
   * Navigate to a path (handles both hash and regular routing)
   */
  private static navigateToPath(path: string): void {
    if (this.useHashRouting()) {
      window.location.hash = path;
    } else {
      // Regular routing with base path
      const fullPath = `${this.getBasePath()}${path}`;
      window.history.pushState({}, '', fullPath);
      // Trigger popstate to notify React Router
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  /**
   * Navigate to multiplayer setup page
   * @param gameId Optional game ID to include in the route
   */
  static navigateToMultiplayerSetup(gameId?: string): void {
    const path = gameId ? `/multiplayer/setup/${gameId}` : '/multiplayer/setup';
    this.navigateToPath(path);
  }

  /**
   * Navigate to multiplayer game page
   * The game ID should already be in the URL query params from importGame/startGame
   */
  static navigateToMultiplayerGame(): void {
    this.navigateToPath('/multiplayer/game');
  }

  /**
   * Navigate to hotseat setup page
   */
  static navigateToHotseatSetup(): void {
    this.navigateToPath('/hotseat/setup');
  }

  /**
   * Navigate to hotseat game page
   */
  static navigateToHotseatGame(): void {
    this.navigateToPath('/hotseat/game');
  }

  /**
   * Navigate to home/welcome page
   */
  static navigateToHome(): void {
    this.navigateToPath('/');
  }

  /**
   * Get game ID from route params (for /multiplayer/setup/:gameId)
   */
  static getGameIdFromRoute(): string | null {
    const pathname = this.getPathname();
    const match = pathname.match(/^\/multiplayer\/setup\/(.+)$/);
    return match ? match[1] : null;
  }
}
