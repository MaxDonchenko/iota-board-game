import { useNavigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';

/**
 * Hook for navigation using React Router
 * Prevents full page reloads and preserves React state
 */
export function useRouting() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  return useMemo(
    () => ({
      /**
       * Navigate to multiplayer setup page
       * @param gameId Optional game ID to include in the route
       */
      navigateToMultiplayerSetup: (gameId?: string) => {
        const path = gameId ? `/multiplayer/setup/${gameId}` : '/multiplayer/setup';
        navigate(path);
      },

      /**
       * Navigate to multiplayer game page
       */
      navigateToMultiplayerGame: () => {
        navigate('/multiplayer/game');
      },

      /**
       * Navigate to hotseat setup page
       */
      navigateToHotseatSetup: () => {
        navigate('/hotseat/setup');
      },

      /**
       * Navigate to hotseat game page
       */
      navigateToHotseatGame: () => {
        navigate('/hotseat/game');
      },

      /**
       * Navigate to home/welcome page
       */
      navigateToHome: () => {
        navigate('/');
      },

      /**
       * Navigate to info page
       */
      navigateToInfo: () => {
        navigate('/info');
      },

      /**
       * Get current pathname
       */
      getPathname: () => pathname,

      /**
       * Navigate to a specific path
       */
      navigate: (path: string) => {
        navigate(path);
      },
    }),
    [navigate, pathname]
  );
}
