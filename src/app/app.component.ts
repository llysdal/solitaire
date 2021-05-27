import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Card } from './classes/card.class';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor() {}

  hasInteracted = false;
  canReset = true;

  deck = [];
  state = null;
  finished = [false, false, false, false, false, false];
  won = false;
  selected = null;
  selectedPos: {col: number, row: number} = null;

  gamesPlayed = 0;
  gamesWon = 0;
  moves = 0;

  ngOnInit(): void {
    this.gamesPlayed = parseInt(this.getCookie('played'), 10);
    if (!this.gamesPlayed) { this.gamesPlayed = 0; }
    this.gamesWon = parseInt(this.getCookie('won'), 10);
    if (!this.gamesWon) { this.gamesWon = 0; }

    this.deck = [];

    for (let s = 0; s < 4; s++) {
      for (let v = 0; v < 9; v++) {
       this.deck.push(new Card(s, v));
      }
    }

    this.state = [];
    for (let c = 0; c < 6; c++) {
      this.state.push([]);
    }
  }

  boot(): void {
    this.newGame();
    this.hasInteracted = true;
  }

  shuffleDeck(): void {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  newGame(): void {
    if (!this.canReset) { return; }

    this.canReset = false;

    this.gamesPlayed++;
    this.setCookie('played', this.gamesPlayed.toString());

    //this.deck = this.deck.reverse();
    this.shuffleDeck();

    this.state = [];
    for (let c = 0; c < 6; c++) {
      this.state.push([]);
    }

    const delay = 90;
    const variation = 10;
    this.deck.forEach((card, index) => {
      setTimeout(() => {
        card.cheated = false;
        //this.state[Math.floor(index / 9)][index % 9] = card;
        this.state[index % 6][Math.floor(index / 6)] = card;
        this.playAudio('place');
        if (index === this.deck.length - 1) {
          this.canReset = true;
        }
      }, index * delay + Math.random() * variation - variation / 2);
    });

    this.moves = 0;
    this.selected = null;
    this.finished = [false, false, false, false, false, false];
    this.won = false;
  }

  cardIsSelected(col: number, row: number): boolean {
    return this.selected
            && col === this.selectedPos.col
            && row === this.selectedPos.row; // when a card is selected, all subsequent cards are also selected
  }


  legalStart(col: number, row: number): boolean {
    if (!this.canReset) { return false; }

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
      if (card === this.selected
        || (col === this.selectedPos.col
            && row === this.selectedPos.row - 1)) {
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

      if (finished) {
        let finishes = 0;
        for (const finish of this.finished) {
          if (finish) { finishes++; }
        }

        if (finishes === 4) {
          this.won = true;
          this.playAudio('win');
          this.gamesWon++;
          this.setCookie('won', this.gamesWon.toString());
        } else {
          this.playAudio('complete');
        }
      }
    }

    this.moves++;
    this.playAudio('place');
  }

  playAudio(name: string): void {
    const audio = new Audio();
    audio.src = `assets/${name}.mp3`;
    audio.load();
    audio.play()
    .then(() => {
      // Audio is playing.
    })
    .catch(error => {
      console.log(error);
    });
  }




  private getCookie(name: string) {
    const ca: Array<string> = document.cookie.split(';');
    const caLen: number = ca.length;
    const cookieName = `${name}=`;
    let c: string;

    for (let i = 0; i < caLen; i += 1) {
        c = ca[i].replace(/^\s+/g, '');
        if (c.indexOf(cookieName) === 0) {
            return c.substring(cookieName.length, c.length);
        }
    }
    return '';
}

private setCookie(name: string, value: string) {
    const d: Date = new Date();
    d.setFullYear(2037);
    const expires = `expires=${d.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}`;
}
}
