import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { Card } from './classes/card.class';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor() {}

  deck = [];
  state = null;
  finished = [false, false, false, false, false, false];
  won = false;
  selected = null;
  selectedPos: {col: number, row: number} = null;

  ngOnInit(): void {
    this.deck = [];

    for (let s = 0; s < 4; s++) {
      for (let v = 0; v < 9; v++) {
       this.deck.push(new Card(s, v));
      }
    }

    this.newGame();
  }

  shuffleDeck(): void {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  newGame(): void {
    //this.deck = this.deck.reverse();
    this.shuffleDeck();

    this.state = [];
    for (let c = 0; c < 6; c++) {
      this.state.push([]);
    }

    this.deck.forEach((card, index) => {
      card.cheated = false;
      this.state[Math.floor(index / 6)][index % 6] = card;
    });

    this.selected = null;
    this.finished = [false, false, false, false, false, false];
    this.won = false;
  }

  undo(): void {

  }


  cardIsSelected(col: number, row: number): boolean {
    return this.selected
            && col === this.selectedPos.col
            && row === this.selectedPos.row; // when a card is selected, all subsequent cards are also selected
  }


  legalStart(col: number, row: number): boolean {
    let cardVal = null;

    for (const card of this.state[col].slice(row)) {
      if (cardVal === null) {
        cardVal = card.value; // first card
      } else if (card.value === cardVal - 1) {
        cardVal = card.value; // consequent cards should be decrementing
      } else {
        return false; // if they arent, abort
      }
    }

    return true;
  }

  legalMove(col: number, row: number): boolean {
    // make sure last card in row
    if (row !== this.state[col].length - 1) {
      return false;
    }

    // make sure dest isn't cheated
    if (this.state[col][row].cheated) {
      return false;
    }

    if (this.selected.value === this.state[col][row].value - 1) {
      // legit move
      this.selected.cheated = false;
      return true;
    }
    else if (this.selectedPos.row === this.state[this.selectedPos.col].length - 1) {
      // cheating (single card has been moved)
      if (!this.state[this.selectedPos.col][this.selectedPos.row].cheated) { // can't cheat a cheated card
        this.selected.cheated = true;
        return true;
      }
      return false;
    }

    return false;
  }

  onCardClick(card: Card, col: number, row: number): void {
    if (!this.selected) {
      if (this.legalStart(col, row)) {
        this.selected = card;
        this.selectedPos = {col, row};
        this.playAudio('lift');
      }
    } else {
      if (card === this.selected) {
        this.selected = null;
        this.playAudio('place');
      }

      if (col === this.selectedPos.col) {
        return;
      }

      if (this.legalMove(col, row)) {
        this.move(col);
      }
    }
  }

  onPileClick(col: number): void {
    if (this.selected) {
      this.selected.cheated = false;
      this.move(col);
    }
  }

  move(col: number): void {
    const temp = this.state[this.selectedPos.col].splice(this.selectedPos.row, 50);
    this.state[col] = [...this.state[col], ...temp];
    this.selected = null;

    if (this.state[col].length === 9) {
      let finished = true;

      let cardVal = null;
      this.state[col].forEach((card: Card) => {
        if (cardVal === null) {
          cardVal = card.value; // first card
        } else if (card.value === cardVal - 1) {
          cardVal = card.value; // consequent cards should be decrementing
        } else {
          finished = false;
        }
      });

      this.finished[col] = finished;

      let finishes = 0;
      for (const finish of this.finished) {
        if (finish) { finishes++; }
      }

      if (finishes === 4) {
        this.won = true;
        this.playAudio('win');
      } else {
        this.playAudio('complete');
      }
    }
    this.playAudio('place');
  }

  playAudio(name: string): void {
    const audio = new Audio();
    audio.src = `/assets/${name}.mp3`;
    audio.load();
    audio.play();
  }
}
