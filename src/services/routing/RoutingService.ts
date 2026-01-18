/**
 * Routing service for managing navigation and URL parameters
 * Centralizes route handling to avoid duplication and ensure consistency
 */

const BASE_PATH = '/iota-board-game/';

export class RoutingService {
  /**
   * Get the base path for routing
   */
  private static getBasePath(): string {
    return BASE_PATH;
  }

  /**
   * Get the current pathname
   */
  static getPathname(): string {
    const path = window.location.pathname;
    const basePath = this.getBasePath();
    if (basePath && path.startsWith(basePath)) {
      return path.slice(basePath.length - 1) || '/';
    }
    return path || '/';
  }

  /**
   * Get a query parameter value from the URL
   */
  static getQueryParam(name: string): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  /**
   * Get game ID from URL query parameters
   */
  static getGameIdFromUrl(): string | null {
    return this.getQueryParam('game');
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
   * Navigate to a path
   */
  private static navigateToPath(path: string): void {
    const url = new URL(window.location.href);
    const basePath = this.getBasePath().replace(/\/$/, ''); // Remove trailing slash
    const cleanPath = path.startsWith('/') ? path : `/${path}`; // Ensure path starts with /

    // Join basePath and cleanPath, ensuring no double slashes
    const fullPath = `${basePath}${cleanPath}`.replace(/\/+/g, '/');
    url.pathname = fullPath;

    // Hard navigation to ensure we stay within the configured base
    window.location.href = url.toString();
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
