import type { SerializableGameState } from '@/utils/gamePersistence';

export const drawByThreefoldRepetitionGameState: SerializableGameState = {
  id: 'game-1767474469607-z2429l804',
  phase: 'ended',
  currentPlayerIndex: 0,
  turnPhase: 'pass',
  players: [
    {
      id: 'player-0',
      name: 'Player 1',
      hand: [
        {
          shape: 'Square',
          number: 1,
          color: 'Red',
          isWild: false,
        },
        {
          shape: 'Square',
          number: 1,
          color: 'Yellow',
          isWild: false,
        },
      ],
      score: 24,
      isAI: false,
      color: '#FF4B2B',
    },
    {
      id: 'player-1',
      name: 'Computer',
      hand: [
        {
          shape: 'Square',
          number: 2,
          color: 'Yellow',
          isWild: false,
        },
        {
          shape: 'Square',
          number: 2,
          color: 'Green',
          isWild: false,
        },
      ],
      score: 16,
      isAI: true,
      difficulty: 'hard',
      color: '#2B95FF',
    },
  ],
  grid: {
    positions: [
      {
        x: 0,
        y: 0,
        card: {
          shape: 'Circle',
          number: 2,
          color: 'Green',
          isWild: false,
        },
      },
      {
        x: 1,
        y: 0,
        card: {
          shape: 'Circle',
          number: 2,
          color: 'Red',
          isWild: false,
        },
      },
      {
        x: 1,
        y: -1,
        card: {
          shape: 'Square',
          number: 1,
          color: 'Green',
          isWild: false,
        },
      },
      {
        x: 2,
        y: -1,
        card: {
          shape: 'Circle',
          number: 1,
          color: 'Yellow',
          isWild: false,
        },
      },
      {
        x: 2,
        y: 0,
        card: {
          shape: 'Circle',
          number: 2,
          color: 'Blue',
          isWild: false,
        },
      },
      {
        x: 0,
        y: 1,
        card: {
          shape: 'Square',
          number: 2,
          color: 'Blue',
          isWild: false,
        },
      },
      {
        x: -1,
        y: 1,
        card: {
          shape: 'Square',
          number: 1,
          color: 'Blue',
          isWild: false,
        },
      },
      {
        x: -3,
        y: 2,
        card: {
          shape: 'Circle',
          number: 1,
          color: 'Green',
          isWild: false,
        },
      },
      {
        x: -2,
        y: 2,
        card: {
          shape: 'Circle',
          number: 1,
          color: 'Blue',
          isWild: false,
        },
      },
      {
        x: -1,
        y: 2,
        card: {
          shape: 'Circle',
          number: 1,
          color: 'Red',
          isWild: false,
        },
      },
      {
        x: -3,
        y: 3,
        card: {
          shape: 'Circle',
          number: 2,
          color: 'Yellow',
          isWild: false,
        },
      },
      {
        x: -2,
        y: 3,
        card: {
          shape: 'Square',
          number: 2,
          color: 'Red',
          isWild: false,
        },
      },
    ],
    starterCard: {
      shape: 'Circle',
      number: 2,
      color: 'Green',
      isWild: false,
    },
    starterPosition: {
      x: 0,
      y: 0,
    },
  },
  deck: {
    drawPile: [],
    discardPile: [],
    gameMode: 'ultra-short',
  },
  isFinalTurn: false,
  gameMode: 'ultra-short',
  settings: {
    theme: 'light',
    useGradients: true,
    gameMode: 'full',
    showInvalidPlacements: true,
    wildcardVariant: 'modern',
    cardVariant: 'modern',
    enableWildcards: false,
  },
  startTime: '2026-01-03T21:07:49.608Z',
  lastMovePlacements: [],
  lastMovePlayerIndex: 0,
};

export const storyGameStates: Record<string, SerializableGameState> = {
  initialGame: {
    id: 'story-initial',
    phase: 'playing',
    currentPlayerIndex: 0,
    turnPhase: 'cardPlacement',
    players: [
      {
        id: 'player-0',
        name: 'Player 1',
        color: 'red',
        score: 0,
        hand: [
          { shape: 'Circle', number: 1, color: 'Red', isWild: false },
          { shape: 'Square', number: 2, color: 'Blue', isWild: false },
          { shape: 'Triangle', number: 3, color: 'Green', isWild: false },
          { shape: 'Plus', number: 4, color: 'Yellow', isWild: false },
        ],
      },
      {
        id: 'player-1',
        name: 'Player 2',
        color: 'blue',
        score: 0,
        hand: [
          { shape: 'Circle', number: 2, color: 'Blue', isWild: false },
          { shape: 'Square', number: 3, color: 'Green', isWild: false },
          { shape: 'Triangle', number: 4, color: 'Yellow', isWild: false },
          { shape: 'Plus', number: 1, color: 'Red', isWild: false },
        ],
      },
    ],
    grid: {
      positions: [
        { x: 0, y: 0, card: { shape: 'Square', number: 1, color: 'Red', isWild: false } },
        { x: 1, y: 0, card: { shape: 'Square', number: 2, color: 'Red', isWild: false } },
        { x: 2, y: 0, card: { shape: 'Square', number: 3, color: 'Red', isWild: false } },
      ],
      starterCard: { shape: 'Square', number: 1, color: 'Red', isWild: false },
      starterPosition: { x: 0, y: 0 },
    },
    deck: {
      drawPile: Array(40).fill({ shape: 'Circle', number: 1, color: 'Red', isWild: false }),
      discardPile: [],
      gameMode: 'full',
    },
    isFinalTurn: false,
    gameMode: 'full',
    settings: {
      theme: 'light',
      useGradients: true,
      gameMode: 'full',
      showInvalidPlacements: true,
      wildcardVariant: 'modern',
      cardVariant: 'modern',
      enableWildcards: true,
      triggerFinalRound: false,
    },
  },

  gameOver: {
    id: 'story-game-over',
    phase: 'ended',
    currentPlayerIndex: 0,
    turnPhase: 'cardPlacement',
    players: [
      {
        id: 'player-0',
        name: 'Player 1',
        color: 'red',
        score: 42,
        hand: [],
      },
      {
        id: 'player-1',
        name: 'Player 2',
        color: 'blue',
        score: 28,
        hand: [
          { shape: 'Circle', number: 2, color: 'Blue', isWild: false },
          { shape: 'Square', number: 3, color: 'Green', isWild: false },
        ],
      },
    ],
    grid: {
      positions: Array(25)
        .fill(0)
        .map((_, i) => ({
          x: i % 5,
          y: Math.floor(i / 5),
          card: { shape: 'Square', number: (i % 4) + 1, color: 'Red', isWild: false },
        })),
      starterCard: { shape: 'Square', number: 1, color: 'Red', isWild: false },
      starterPosition: { x: 0, y: 0 },
    },
    deck: {
      drawPile: [],
      discardPile: Array(30).fill({ shape: 'Circle', number: 1, color: 'Red', isWild: false }),
      gameMode: 'full',
    },
    isFinalTurn: false,
    gameMode: 'full',
    settings: {
      theme: 'light',
      useGradients: true,
      gameMode: 'full',
      showInvalidPlacements: true,
      wildcardVariant: 'modern',
      cardVariant: 'modern',
      enableWildcards: true,
      triggerFinalRound: false,
    },
  },
};

export const noPlacableCardAfterWildcard: SerializableGameState = {
  id: 'game-1767490479665-8p3wgb02c',
  phase: 'playing',
  currentPlayerIndex: 0,
  turnPhase: 'cardPlacement',
  players: [
    {
      id: 'player-0',
      name: 'Player 1',
      hand: [
        {
          shape: 'Triangle',
          number: 3,
          color: 'Red',
          isWild: false,
        },
        {
          shape: 'Square',
          number: 1,
          color: 'Red',
          isWild: true,
        },
        {
          shape: 'Triangle',
          number: 2,
          color: 'Blue',
          isWild: false,
        },
        {
          shape: 'Square',
          number: 3,
          color: 'Blue',
          isWild: false,
        },
      ],
      score: 0,
      isAI: false,
      color: '#FF4B2B',
    },
    {
      id: 'player-1',
      name: 'Computer 2',
      hand: [
        {
          shape: 'Plus',
          number: 2,
          color: 'Red',
          isWild: false,
        },
        {
          shape: 'Circle',
          number: 1,
          color: 'Blue',
          isWild: false,
        },
        {
          shape: 'Square',
          number: 1,
          color: 'Red',
          isWild: false,
        },
        {
          shape: 'Triangle',
          number: 1,
          color: 'Blue',
          isWild: false,
        },
      ],
      score: 0,
      isAI: true,
      difficulty: 'medium',
      color: '#2B95FF',
    },
    {
      id: 'player-2',
      name: 'Computer 3',
      hand: [
        {
          shape: 'Triangle',
          number: 4,
          color: 'Red',
          isWild: false,
        },
        {
          shape: 'Triangle',
          number: 2,
          color: 'Red',
          isWild: false,
        },
        {
          shape: 'Square',
          number: 2,
          color: 'Blue',
          isWild: false,
        },
        {
          shape: 'Square',
          number: 2,
          color: 'Red',
          isWild: false,
        },
      ],
      score: 0,
      isAI: true,
      difficulty: 'medium',
      color: '#61BB46',
    },
    {
      id: 'player-3',
      name: 'Computer 4',
      hand: [
        {
          shape: 'Circle',
          number: 4,
          color: 'Red',
          isWild: false,
        },
        {
          shape: 'Square',
          number: 4,
          color: 'Blue',
          isWild: false,
        },
        {
          shape: 'Square',
          number: 3,
          color: 'Red',
          isWild: false,
        },
        {
          shape: 'Square',
          number: 4,
          color: 'Red',
          isWild: false,
        },
      ],
      score: 0,
      isAI: true,
      difficulty: 'medium',
      color: '#F9A51B',
    },
  ],
  grid: {
    positions: [
      {
        x: 0,
        y: 0,
        card: {
          shape: 'Triangle',
          number: 1,
          color: 'Red',
          isWild: false,
        },
      },
    ],
    starterCard: {
      shape: 'Triangle',
      number: 1,
      color: 'Red',
      isWild: false,
    },
    starterPosition: {
      x: 0,
      y: 0,
    },
  },
  deck: {
    drawPile: [
      {
        shape: 'Circle',
        number: 3,
        color: 'Blue',
        isWild: false,
      },
      {
        shape: 'Plus',
        number: 4,
        color: 'Red',
        isWild: false,
      },
      {
        shape: 'Circle',
        number: 3,
        color: 'Red',
        isWild: false,
      },
      {
        shape: 'Plus',
        number: 2,
        color: 'Blue',
        isWild: false,
      },
      {
        shape: 'Plus',
        number: 3,
        color: 'Red',
        isWild: false,
      },
      {
        shape: 'Circle',
        number: 1,
        color: 'Red',
        isWild: false,
      },
      {
        shape: 'Plus',
        number: 4,
        color: 'Blue',
        isWild: false,
      },
      {
        shape: 'Circle',
        number: 2,
        color: 'Red',
        isWild: false,
      },
      {
        shape: 'Circle',
        number: 4,
        color: 'Blue',
        isWild: false,
      },
      {
        shape: 'Circle',
        number: 2,
        color: 'Blue',
        isWild: false,
      },
      {
        shape: 'Triangle',
        number: 3,
        color: 'Blue',
        isWild: false,
      },
      {
        shape: 'Plus',
        number: 3,
        color: 'Blue',
        isWild: false,
      },
      {
        shape: 'Plus',
        number: 1,
        color: 'Red',
        isWild: false,
      },
      {
        shape: 'Triangle',
        number: 4,
        color: 'Blue',
        isWild: false,
      },
      {
        shape: 'Plus',
        number: 1,
        color: 'Blue',
        isWild: false,
      },
      {
        shape: 'Square',
        number: 1,
        color: 'Blue',
        isWild: false,
      },
    ],
    discardPile: [],
    gameMode: 'short',
  },
  isFinalTurn: false,
  gameMode: 'short',
  settings: {
    theme: 'dark',
    useGradients: true,
    gameMode: 'full',
    showInvalidPlacements: true,
    wildcardVariant: 'modern',
    cardVariant: 'modern',
    enableWildcards: true,
    triggerFinalRound: false,
  },
  startTime: '2026-01-04T01:34:39.666Z',
};
