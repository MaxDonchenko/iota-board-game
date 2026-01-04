import type { Shape, Number, Color, WildValue } from '@/types/Card.types';

export class Card {
  shape?: Shape;
  number?: Number;
  color?: Color;
  isWild: boolean;
  wildValue?: WildValue;

  // For wildcards we intentionally do not keep a default shape/number/color.
  // The caller should assign `wildValue` when previewing/confirming the wildcard.
  constructor(
    shape?: Shape,
    number?: Number,
    color?: Color,
    isWild = false,
    wildValue?: WildValue
  ) {
    this.isWild = !!isWild;
    if (!this.isWild) {
      if (shape === undefined || number === undefined || color === undefined) {
        throw new Error('Non-wild cards must have shape, number and color');
      }
      this.shape = shape;
      this.number = number;
      this.color = color;
    } else if (wildValue) {
      this.wildValue = wildValue;
      // Synchronize properties with wildValue
      this.shape = wildValue.shape;
      this.number = wildValue.number;
      this.color = wildValue.color;
    }
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
    return this.isWild ? 0 : (this.number as number);
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

  getEffectiveShape(): Shape | undefined {
    if (this.isWild && this.wildValue) {
      return this.wildValue.shape;
    }
    return this.shape;
  }

  getEffectiveNumber(): Number | undefined {
    if (this.isWild && this.wildValue) {
      return this.wildValue.number;
    }
    return this.number;
  }

  getEffectiveColor(): Color | undefined {
    if (this.isWild && this.wildValue) {
      return this.wildValue.color;
    }
    return this.color;
  }
}
