import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { GameBoard } from '../components/GameBoard/GameBoard';
import { Card } from '../components/Card/Card';
import { Grid } from '../game/Grid';
import { Card as CardClass } from '../game/Card';
import type { Color } from '../types/Card.types';

const meta: Meta = {
  title: 'DevMode/CardTester',
  tags: ['autodocs'],
};

export default meta;

function CardTesterContent() {
  const [shape, setShape] = useState<'Square' | 'Circle' | 'Triangle' | 'Plus'>('Square');
  const [number, setNumber] = useState<1 | 2 | 3 | 4>(1);
  const [color, setColor] = useState<Color>('Red');
  const [isWild, setIsWild] = useState(false);

  const card = new CardClass(shape, number, color, isWild);
  const grid = new Grid();
  grid.setStarterCard(0, 0, card);

  return (
    <div style={{ padding: '1rem', color: 'var(--text-primary)' }}>
      <h3 style={{ color: 'var(--text-primary)' }}>Card Tester</h3>
      <p style={{ color: 'var(--text-primary)' }}>Adjust the controls below to test different card combinations.</p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '8px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            Shape:
          </label>
          <select
            value={shape}
            onChange={(e) => setShape(e.target.value as typeof shape)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="Square">Square</option>
            <option value="Circle">Circle</option>
            <option value="Triangle">Triangle</option>
            <option value="Plus">Plus</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            Number:
          </label>
          <select
            value={number}
            onChange={(e) => setNumber(Number(e.target.value) as typeof number)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            Color:
          </label>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value as Color)}
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="Red">Red</option>
            <option value="Blue">Blue</option>
            <option value="Green">Green</option>
            <option value="Yellow">Yellow</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            <input
              type="checkbox"
              checked={isWild}
              onChange={(e) => setIsWild(e.target.checked)}
              style={{ marginRight: '0.5rem' }}
            />
            Wild Card
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ color: 'var(--text-primary)' }}>Card Preview:</h4>
        <div style={{ display: 'inline-block', marginTop: '0.5rem' }}>
          <Card card={card} />
        </div>
      </div>

      <div>
        <h4 style={{ color: 'var(--text-primary)' }}>Card on Board (as Starter):</h4>
        <GameBoard
          grid={grid}
          selectedCards={[]}
          onPlaceCard={() => {}}
        />
      </div>

      <div style={{ 
        marginTop: '1rem', 
        padding: '1rem', 
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: 'var(--text-primary)'
      }}>
        <strong style={{ color: 'var(--text-primary)' }}>Card Details:</strong>
        <ul style={{ marginTop: '0.5rem', marginBottom: 0, color: 'var(--text-primary)' }}>
          <li>Shape: {card.getEffectiveShape()}</li>
          <li>Number: {card.getEffectiveNumber()}</li>
          <li>Color: {card.getEffectiveColor()}</li>
          <li>Is Wild: {card.isWild ? 'Yes' : 'No'}</li>
          {card.isWild && card.wildValue && (
            <li>Wild Value: {card.wildValue.shape}, {card.wildValue.number}, {card.wildValue.color}</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export const CardTester: StoryObj = {
  render: () => (
    <ThemeProvider>
      <CardTesterContent />
    </ThemeProvider>
  ),
};

