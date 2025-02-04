import { Gem } from './gem.js';

const gemTypes = new Set(['R', 'G', 'B']);

export class Game {
  constructor(cols, rows, gemOffset = 3) {
    this._cols = cols;
    this._rows = rows;
    this._gemOffset = gemOffset;
    this._field = new Array(cols * rows).fill(null);
    this._gems = [];
  }

  exec(inst) {
    const [types, moves] = inst;

    const gems = types.split('').map((type, i) => {
      if (!gemTypes.has(type)) {
        console.error(`Instruction: ${inst}. Bad gem type: ${type}`);
      }

      return this._addGem(new Gem(type, { top: i, left: this._gemOffset }));
    });

    const history = [this._copyField()];

    moves.split('').forEach((move) => {
      try {
        this._handleMoveInst(gems, move);
        history.push(this._copyField());
      } catch (err) {
        console.error(`Instruction: ${inst}. ${err.message}`);
      }
    });

    while (this._tick()) {
      history.push(this._copyField());
    }

    return history;
  }

  getStateStr() {
    const state = [];

    for (let i = 0; i < this._field.length; ) {
      let str = '';

      for (let c = 0; c < this._cols; ++c, ++i) {
        const item = this._field[i];
        str += item ? item.type() : ' ';
      }

      state.push(str);
    }

    return state.join('\n');
  }

  _tick() {
    let isUnstable = false;

    for (let i = this._field.length - 1; i >= 0; --i) {
      if (this._field[i]) {
        const i1 = i + this._cols;

        if (i1 < this._field.length && this._field[i1] == null) {
          isUnstable = true;
          this._field[i1] = this._field[i];
          this._field[i] = null;
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

      switch (move) {
        case 'L':
          gem.incLeft(-1);
          break;

        case 'R':
          gem.incLeft(1);
          break;

        case 'A':
          if (i > 0) {
            gem.incLeft(1);
            gem.incTop(-1);
          }
          break;

        case 'B':
          if (i > 0) {
            gem.incLeft(-1);
            gem.incTop(-1);
          }
          break;

        default:
          throw new Error(`Bad move: ${move}`);
      }

      const newIndex = this._posToIndex(gem.pos());
      this._field[oldIndex] = null;
      this._field[newIndex] = gem;
    });
  }

  _posToIndex({ top, left }) {
    return this._cols * top + left;
  }
}
