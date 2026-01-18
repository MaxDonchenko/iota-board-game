import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RoutingService } from '@/services/routing/RoutingService';

describe('RoutingService', () => {
  const originalHistory = window.history;

  beforeEach(() => {
    vi.clearAllMocks();
    window.history = {
      ...originalHistory,
      pushState: vi.fn(),
      replaceState: vi.fn(),
    } as any;
  });

  describe('URL construction - double slash prevention', () => {
    it('should prevent double slashes when base path has trailing slash and path starts with slash', () => {
      let capturedHref = '';
      const initialHref = 'https://maxdonchenko.github.io/iota-board-game/';
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/iota-board-game/',
          hostname: 'maxdonchenko.github.io',
          hash: '',
          search: '',
          origin: 'https://maxdonchenko.github.io',
          get href() {
            return capturedHref || initialHref;
          },
          set href(value: string) {
            capturedHref = value;
          },
        },
        writable: true,
        configurable: true,
      });

      RoutingService.navigateToMultiplayerSetup('room-123');

      expect(capturedHref).toBe(
        'https://maxdonchenko.github.io/iota-board-game/multiplayer/setup/room-123'
      );
      // Check for double slashes in the path (after the protocol)
      const pathPart = capturedHref.replace(/^https?:\/\//, '');
      expect(pathPart).not.toContain('//');
    });

    it('should prevent double slashes when navigating to home', () => {
      let capturedHref = '';
      const initialHref = 'https://maxdonchenko.github.io/iota-board-game/multiplayer/setup';
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/iota-board-game/multiplayer/setup',
          hostname: 'maxdonchenko.github.io',
          hash: '',
          search: '',
          origin: 'https://maxdonchenko.github.io',
          get href() {
            return capturedHref || initialHref;
          },
          set href(value: string) {
            capturedHref = value;
          },
        },
        writable: true,
        configurable: true,
      });

      RoutingService.navigateToHome();

      // When navigating to home with path '/', the result should be the base path
      // The URL constructor will normalize trailing slashes, so we check it ends correctly
      expect(capturedHref).toMatch(/^https:\/\/maxdonchenko\.github\.io\/iota-board-game\/?$/);
      // Check for double slashes in the path (after the protocol)
      const pathPart = capturedHref.replace(/^https?:\/\//, '');
      expect(pathPart).not.toContain('//'); // No double slashes in the path
    });

    it('should prevent double slashes when navigating to multiplayer setup without gameId', () => {
      let capturedHref = '';
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/iota-board-game/',
          hostname: 'maxdonchenko.github.io',
          hash: '',
          search: '',
          origin: 'https://maxdonchenko.github.io',
          get href() {
            return capturedHref || 'https://maxdonchenko.github.io/iota-board-game/';
          },
          set href(value: string) {
            capturedHref = value;
          },
        },
        writable: true,
        configurable: true,
      });

      RoutingService.navigateToMultiplayerSetup();

      expect(capturedHref).toBe('https://maxdonchenko.github.io/iota-board-game/multiplayer/setup');
      // Check for double slashes in the path (after the protocol)
      const pathPart = capturedHref.replace(/^https?:\/\//, '');
      expect(pathPart).not.toContain('//');
    });

    it('should handle path normalization with multiple slashes', () => {
      // Test the normalization logic directly
      const basePath = '/iota-board-game/'.replace(/\/$/, ''); // Remove trailing slash
      const path = '/multiplayer/setup/room-123';
      const fullPath = `${basePath}${path}`.replace(/\/+/g, '/');

      expect(fullPath).toBe('/iota-board-game/multiplayer/setup/room-123');
      expect(fullPath).not.toContain('//');
    });
  });

  describe('URL query parameters', () => {
    it('should set game ID in URL using URL constructor', () => {
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://maxdonchenko.github.io/iota-board-game/multiplayer/setup',
          search: '',
          hostname: 'maxdonchenko.github.io',
          pathname: '/iota-board-game/multiplayer/setup',
          hash: '',
          origin: 'https://maxdonchenko.github.io',
        },
        writable: true,
        configurable: true,
      });

      RoutingService.setGameIdInUrl('game-123');

      expect(window.history.replaceState).toHaveBeenCalled();
      const callArgs = (window.history.replaceState as any).mock.calls[0];
      const urlString = callArgs[2];
      const url = new URL(urlString);
      expect(url.searchParams.get('game')).toBe('game-123');
      expect(url.pathname).toBe('/iota-board-game/multiplayer/setup');
    });

    it('should remove game ID from URL using URL constructor', () => {
      Object.defineProperty(window, 'location', {
        value: {
          href: 'https://maxdonchenko.github.io/iota-board-game/multiplayer/setup?game=game-123',
          search: '?game=game-123',
          hostname: 'maxdonchenko.github.io',
          pathname: '/iota-board-game/multiplayer/setup',
          hash: '',
          origin: 'https://maxdonchenko.github.io',
        },
        writable: true,
        configurable: true,
      });

      RoutingService.removeGameIdFromUrl();

      expect(window.history.replaceState).toHaveBeenCalled();
      const callArgs = (window.history.replaceState as any).mock.calls[0];
      const urlString = callArgs[2];
      const url = new URL(urlString);
      expect(url.searchParams.get('game')).toBeNull();
    });

    it('should get game ID from URL query parameters', () => {
      Object.defineProperty(window, 'location', {
        value: {
          search: '?game=game-456&mode=supabase',
          hostname: 'maxdonchenko.github.io',
        },
        writable: true,
        configurable: true,
      });

      const gameId = RoutingService.getGameIdFromUrl();

      expect(gameId).toBe('game-456');
    });
  });

  describe('Pathname extraction', () => {
    it('should extract pathname correctly with base path', () => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/iota-board-game/multiplayer/setup/room-123',
          hostname: 'maxdonchenko.github.io',
          hash: '',
          search: '',
        },
        writable: true,
        configurable: true,
      });

      const pathname = RoutingService.getPathname();

      expect(pathname).toBe('/multiplayer/setup/room-123');
    });

    it('should extract pathname correctly on localhost', () => {
      Object.defineProperty(window, 'location', {
        value: {
          hostname: 'localhost',
          pathname: '/multiplayer/setup/room-456',
          hash: '',
          search: '',
        },
        writable: true,
        configurable: true,
      });

      const pathname = RoutingService.getPathname();

      expect(pathname).toBe('/multiplayer/setup/room-456');
    });

    it('should get game ID from route', () => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/iota-board-game/multiplayer/setup/room-789',
          hostname: 'maxdonchenko.github.io',
          hash: '',
          search: '',
        },
        writable: true,
        configurable: true,
      });

      const gameId = RoutingService.getGameIdFromRoute();

      expect(gameId).toBe('room-789');
    });
  });
});
