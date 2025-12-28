import type { Meta, StoryObj } from '@storybook/react';
import { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { Card } from '../components/Card/Card';
import { Card as CardClass } from '../game/Card';
import type { Color, Shape } from '../types/Card.types';

const meta: Meta = {
  title: 'DevMode/CardVariants',
  tags: ['autodocs'],
};

export default meta;

function CardVariantsContent() {
  const { settings, setWildcardVariant, setCardVariant, updateSettings } = useTheme();
  
  // Sync Storybook theme with ThemeContext
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const storybookTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark';
      if (storybookTheme && storybookTheme !== settings.theme) {
        updateSettings({ theme: storybookTheme });
      }
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    
    return () => observer.disconnect();
  }, [settings.theme, updateSettings]);
  const [selectedShape, setSelectedShape] = useState<Shape>('Circle');
  const [selectedNumber, setSelectedNumber] = useState<1 | 2 | 3 | 4>(3);
  const [selectedColor, setSelectedColor] = useState<Color>('Blue');

  const regularCard = new CardClass(selectedShape, selectedNumber, selectedColor, false);
  const wildcard = new CardClass('Square', 1, 'Red', true);

  // Theme-aware colors for Storybook
  const textColor = settings.theme === 'dark' ? '#000000' : '#FFFFFF';
  const oppositeColor = settings.theme === 'dark' ? '#FFFFFF' : '#000000';

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ color: 'var(--text-primary)', marginBottom: '2rem' }}>Card Variants</h2>
      
      {/* Regular Card Variants */}
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Regular Card Variants</h3>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>Modern</div>
            <Card card={regularCard} cardVariant="modern" />
          </div>
          <div>
            <div style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>Original</div>
            <Card card={regularCard} cardVariant="original" />
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '8px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Shape:</label>
            <select
              value={selectedShape}
              onChange={(e) => setSelectedShape(e.target.value as Shape)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            >
              <option value="Square">Square</option>
              <option value="Circle">Circle</option>
              <option value="Triangle">Triangle</option>
              <option value="Plus">Plus</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Number:</label>
            <select
              value={selectedNumber}
              onChange={(e) => setSelectedNumber(Number(e.target.value) as 1 | 2 | 3 | 4)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Color:</label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value as Color)}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
            >
              <option value="Red">Red</option>
              <option value="Blue">Blue</option>
              <option value="Green">Green</option>
              <option value="Yellow">Yellow</option>
            </select>
          </div>
        </div>
      </div>

      {/* Wildcard Variants */}
      <div>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Wildcard Variants</h3>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div>
            <div style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>Modern (Grid)</div>
            <Card card={wildcard} wildcardVariant="modern" />
          </div>
          <div>
            <div style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>Original</div>
            <Card card={wildcard} wildcardVariant="original" />
          </div>
        </div>
      </div>

      {/* All Shapes and Numbers */}
      <div style={{ marginTop: '3rem' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>All Card Variants</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {(['Square', 'Circle', 'Triangle', 'Plus'] as Shape[]).map(shape => 
            ([1, 2, 3, 4] as const).map(number => 
              (['Red', 'Blue', 'Green', 'Yellow'] as Color[]).map(color => (
                <div key={`${shape}-${number}-${color}`} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    {shape} {number} {color}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <Card card={new CardClass(shape, number, color, false)} cardVariant="modern" />
                    <Card card={new CardClass(shape, number, color, false)} cardVariant="original" />
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
}

export const CardVariants: StoryObj = {
  render: () => (
    <ThemeProvider>
      <CardVariantsContent />
    </ThemeProvider>
  ),
};

