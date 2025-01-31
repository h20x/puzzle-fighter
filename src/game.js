import { Gem } from './gem.js';

export class Game {
  constructor(cols, rows, gemOffset = 3) {
    this._cols = cols;
    this._rows = rows;
    this._gemOffset = gemOffset;
    this._field = new Array(cols * rows).fill(null);
    this._gems = [];
  }

  exec(inst) {
    const [gemTypes, moves] = inst;

    const gems = gemTypes.split('').map((type, i) => {
      return this._addGem(new Gem(type, { top: i, left: this._gemOffset }));
    });

    const history = [this._copyField()];

    moves.split('').forEach((move) => {
      this._handleMoveInst(gems, move);
      history.push(this._copyField());
    });

    while (this._tick()) {
      history.push(this._copyField());
    }

    return history;
  }

  _tick() {
    let isUnstable = false;

    for (let r = this._rows - 1; r >= 0; --r) {
      for (let c = this._cols - 1; c >= 0; --c) {
        const i = this._calcIndex(r, c);

        if (this._field[i]) {
          const i1 = this._calcIndex(r + 1, c);

          if (i1 >= 0 && this._field[i1] == null) {
            isUnstable = true;
            this._field[i1] = this._field[i];
            this._field[i] = null;
          }
        }
      }
    }

    return isUnstable;
  }

  _addGem(gem) {
    const index = this._posToIndex(gem.pos());
    this._field[index] = gem;
    this._gems.push(gem);

    return gem;
  }

  _copyField() {
    return this._field.map((cell) => {
      return cell ? cell.clone() : null;
    });
  }

  _handleMoveInst(gems, move) {
    gems.forEach((gem, i) => {
      const oldIndex = this._posToIndex(gem.pos());
      this._field[oldIndex] = null;

      if ('L' === move) {
        gem.incLeft(-1);
      } else if ('R' === move) {
        gem.incLeft(1);
      } else if ('A' === move && i > 0) {
        gem.incLeft(1);
        gem.incTop(-1);
      } else if ('B' === move && i > 0) {
        gem.incLeft(-1);
        gem.incTop(-1);
      }

      const newIndex = this._posToIndex(gem.pos());
      this._field[newIndex] = gem;
    });
  }

  _posToIndex({ top, left }) {
    return this._calcIndex(top, left);
  }

  _calcIndex(row, col) {
    const idx = this._cols * row + col;

    return idx < 0 || idx >= this._field.length ? -1 : idx;
  }
}
