import type { Shape, Number, Color, WildValue } from '@/types/Card.types';

export class Card {
  shape: Shape;
  number: Number;
  color: Color;
  isWild: boolean;
  wildValue?: WildValue;

  constructor(shape: Shape, number: Number, color: Color, isWild = false, wildValue?: WildValue) {
    this.shape = shape;
    this.number = number;
    this.color = color;
    this.isWild = isWild;
    this.wildValue = wildValue;
  }

  equals(other: Card): boolean {
    if (this.isWild && other.isWild) {
      return (
        this.wildValue?.shape === other.wildValue?.shape &&
        this.wildValue?.number === other.wildValue?.number &&
        this.wildValue?.color === other.wildValue?.color
      );
    }
    if (this.isWild && this.wildValue) {
      return (
        this.wildValue.shape === other.shape &&
        this.wildValue.number === other.number &&
        this.wildValue.color === other.color
      );
    }
    if (other.isWild && other.wildValue) {
      return (
        other.wildValue.shape === this.shape &&
        other.wildValue.number === this.number &&
        other.wildValue.color === this.color
      );
    }
    return this.shape === other.shape && this.number === other.number && this.color === other.color;
  }

  toString(): string {
    if (this.isWild && this.wildValue) {
      return `Wild (${this.wildValue.shape}, ${this.wildValue.number}, ${this.wildValue.color})`;
    }
    if (this.isWild) {
      return 'Wild';
    }
    return `${this.shape} ${this.number} ${this.color}`;
  }

  getValue(): number {
    return this.isWild ? 0 : this.number;
  }

  setWildValue(value: WildValue): void {
    if (!this.isWild) {
      throw new Error('Cannot set wild value on non-wild card');
    }
    this.wildValue = value;
  }

  matchesWild(other: Card): boolean {
    if (!this.isWild || !this.wildValue) {
      return false;
    }
    return (
      this.wildValue.shape === other.shape &&
      this.wildValue.number === other.number &&
      this.wildValue.color === other.color
    );
  }

  getEffectiveValue(): Shape | Number | Color {
    if (this.isWild && this.wildValue) {
      return {
        shape: this.wildValue.shape,
        number: this.wildValue.number,
        color: this.wildValue.color,
      } as unknown as Shape | Number | Color;
    }
    return this.shape;
  }

  getEffectiveShape(): Shape {
    if (this.isWild && this.wildValue) {
      return this.wildValue.shape;
    }
    return this.shape;
  }

  getEffectiveNumber(): Number {
    if (this.isWild && this.wildValue) {
      return this.wildValue.number;
    }
    return this.number;
  }

  getEffectiveColor(): Color {
    if (this.isWild && this.wildValue) {
      return this.wildValue.color;
    }
    return this.color;
  }
}
