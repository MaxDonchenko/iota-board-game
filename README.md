# IOTA Card Game

A digital implementation of the IOTA card game built with React, TypeScript, and Vite.

## Links

- 🎮 [Play the Game](https://MaxDonchenko.github.io/iota-board-game/)
- 📚 [View Storybook](https://MaxDonchenko.github.io/iota-board-game/storybook/)

## About IOTA

**IOTA is a card game by Gamewright Games.** This implementation is created for educational and personal use purposes. The game rules and mechanics are based on the official IOTA card game published by Gamewright Games.

For more information about the official game, please visit [Game review page](https://www.theboardgamefamily.com/2013/02/iota-card-game-review/). Rules of the game can be found [here](https://cdn.1j1ju.com/medias/0e/e4/7f-iota-rulebook.pdf).

## Features

- **Full Game Implementation**: Complete IOTA card game logic with all rules
- **Two Game Modes**:
  - Short mode: 32 cards + 1 wild card
  - Full mode: 64 cards + 2 wild cards
- **Light/Dark Theme**: Toggle between light and dark modes
- **Card Gradients**: Optional gradient styling for cards
- **Advanced Animations**: Smooth hover effects on cards (rotate, transform, scale)
- **TypeScript**: Fully typed with strict type checking (no `any` types)
- **Responsive Design**: Works on desktop and mobile devices
- **Settings Persistence**: Game preferences saved in localStorage

## Game Rules

### Objective

Score the most points by adding cards to the grid to form valid lines.

### Card Properties

Each card has three properties:

- **Shape**: Square, Triangle, Circle, Plus
- **Number**: 1, 2, 3, 4
- **Color**: Red, Blue, Green, Yellow

### Line Rules

- A line consists of 2, 3, or 4 cards
- Cards must be in a single straight row or column
- Maximum line length: 4 cards
- For each property (color, shape, number), cards must be:
  - **All the same**, OR
  - **All different**

### Scoring

- Add face values of all cards in every line created or extended
- A card counts once per line it belongs to (cards in two lines scored twice)
- **Lots** (4-card lines): Double your turn's score for each lot
- **All 4 cards**: Double again if you play all 4 cards in one turn
- **Final turn**: Score is doubled when draw pile is empty and you play your last card

### Wild Cards

- Wild cards have a face value of 0
- Can represent any card combination
- Must represent the same card in all lines it belongs to
- Can be recycled: Replace a wild card on the grid with a matching real card from your hand

### Game End

The game ends when the draw pile is empty and one player plays their last card.

## Installation

```bash
npm install
```

## Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing

Unit tests are written for all game logic modules:

- Card system
- Deck management
- Grid system
- Validation logic
- Scoring system
- Wild card management

Run tests with:

```bash
npm test
```

## Storybook

Dev mode with hard-coded use cases for debugging:

```bash
npm run storybook
```

## Deployment

Deploy to GitHub Pages:

```bash
npm run deploy
```

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Vitest** - Testing framework
- **date-fns** - Date utilities
- **colorjs.io** - Color utilities

## Project Structure

```
src/
├── components/     # React components
├── game/          # Game logic modules
├── hooks/         # React hooks
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
├── styles/         # CSS styles
└── context/       # React context providers
```

## Copyright and Attribution

**IOTA is a card game by Gamewright Games.**

This digital implementation is created for educational and personal use purposes. All game rules, mechanics, and design elements are based on the official IOTA card game published by Gamewright Games.

This project is not affiliated with, endorsed by, or associated with Gamewright Games. Please support the official game by purchasing it from authorized retailers.

## License

This project is for educational purposes only. Please respect Gamewright Games' copyright and intellectual property rights.
