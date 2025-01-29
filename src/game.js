import { Gem } from './gem.js';

export class Game {
  constructor(width, height, gemOffset = 3) {
    this._width = width;
    this._height = height;
    this._gemOffset = gemOffset;
    this._field = new Array(width * height).fill(null);
    this._gems = [];
  }

  exec(inst) {
    const [gemTypes, moves] = inst;

    const gems = gemTypes.map((type, i) => {
      return this._addGem(new Gem(type, { top: i, left: this.gemOffset }));
    });

    const history = [this._copyField()];

    moves.forEach((move) => {
      this._handleMoveInst(gems, move);
      history.push(this._copyField());
    });

    while (_tick()) {
      history.push(this._copyField());
    }

    return history;
  }

  _tick() {
    return false;
  }

  _addGem(gem) {
    const index = this._calcIndex(gem.pos());
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
      const oldIndex = this._calcIndex(gem.pos());
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

      const newIndex = this._calcIndex(gem.pos());
      this._field[newIndex] = gem;
    });
  }

  _calcIndex({ top, left }) {
    return this._width * top + left;
  }
}
