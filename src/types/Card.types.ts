export type Shape = 'Square' | 'Triangle' | 'Circle' | 'Plus';
export type Number = 1 | 2 | 3 | 4;
export type Color = 'Red' | 'Blue' | 'Green' | 'Yellow';

export interface WildValue {
  shape: Shape;
  number: Number;
  color: Color;
}

