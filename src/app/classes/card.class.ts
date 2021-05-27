export class Card {
  suit: number;
  value: number;
  cheated: boolean;

  constructor(suit: number, value: number) {
    this.suit = suit;
    this.value = value;
    this.cheated = false;
  }

  img(): string {
    return 'assets/card_' +
    (this.value <  5 ? ['diamond', 'heart', 'spade', 'club'][this.suit] + '_' : '') +
    [
      '6', '7', '8', '9', '10',
      'jack', 'queen', 'king', 'ace'
    ][this.value] + '.png';
  }
}
