export interface UseCase {
  name: string;
  description: string;
  gameState: unknown; // Will be GameState when imported
}

