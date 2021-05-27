export class Card {
  suit: number;
  value: number;
  cheated: boolean;

  constructor(suit: number, value: number) {
    this.suit = suit;
    this.value = value;
    this.cheated = false;
  }

  symbol(): string {
    return ['♦','♥','♣','♠','10'][this.suit];
  }

  repr(): string {
    return ['6', '7', '8', '9', '10', 'V', 'D', 'K', 'T'][this.value];
  }

  img(): string {
    return 'assets/card_' +
    (this.value <  5 ? ['diamond', 'heart', 'spade', 'club'][this.suit] + '_' : '') +
    [
      '6', '7', '8', '9', '10',
      'jack', 'queen', 'king', 'ace'
    ][this.value] + '.png';
  }

  imgSelected(): string {
    return [
      'assets/card_cheat.png', 'assets/card_cheat.png', 'assets/card_cheat.png', 'assets/card_cheat.png', 'assets/card_cheat.png',
      'assets/face_jack_cheat.png', 'assets/face_queen_cheat.png', 'assets/face_king_cheat.png', 'assets/face_ace_cheat.png'
    ][this.value];
  }
}
