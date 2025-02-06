import { Gem, PowerGem } from './gem.js';

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

      return this._addGem(new Gem(type, this._cols * i + this._gemOffset));
    });

    const history = [this._copyGems()];

    moves.split('').forEach((move) => {
      try {
        this._handleMoveInst(gems, move);
        history.push(this._copyGems());
      } catch (err) {
        console.error(`Instruction: ${inst}. ${err.message}`);
      }
    });

    while (this._tick(gems)) {
      history.push(this._copyGems());
    }

    this._findPowerGems();
    history.push(this._copyGems());

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

  _findPowerGems() {
    for (let i = 0; i < this._field.length; ++i) {
      const gem = this._at(i);

      if (gem && !gem.parent()) {
        const gems = [
          gem,
          this._at(i + 1),
          this._at(i + this._cols),
          this._at(i + this._cols + 1),
        ];
        const isEqual = gems.every((g) => gem.isEqual(g));

        if (isEqual) {
          const powerGem = new PowerGem(this._cols, gems);
          gems.forEach((gem) => gem.setParent(powerGem));
          this._expandRight(powerGem);
          this._expandBottom(powerGem);
        }
      }
    }
  }

  _expandRight(pgem) {
    const gems = [];

    do {
      gems.length = 0;

      for (let i = 0; i < pgem.height(); ++i) {
        gems.push(this._at(pgem.pos() + pgem.width() + i * this._cols));
      }
    } while (pgem.expand('H', gems));
  }

  _expandBottom(pgem) {
    const gems = [];

    do {
      gems.length = 0;

      for (let i = 0; i < pgem.width(); ++i) {
        gems.push(this._at(pgem.pos() + pgem.height() + i));
      }
    } while (pgem.expand('V', gems));
  }

  _tick(gems) {
    let isUnstable = false;

    for (let n = gems.length - 1; n >= 0; --n) {
      isUnstable = this._moveGem(gems[n], 'D');
    }

    return isUnstable;
  }

  _addGem(gem) {
    this._field[gem.pos()] = gem;
    this._gems.push(gem);

    return gem;
  }

  _moveGem(gem, cmd) {
    const cur = gem.pos();
    let next;

    switch (cmd) {
      case 'L':
        next = cur - 1;
        break;

      case 'R':
        next = cur + 1;
        break;

      case 'A':
        next = cur - this._cols + 1;
        break;

      case 'B':
        next = cur - this._cols - 1;
        break;

      case 'D':
        next = cur + this._cols;
        break;

      default:
        return false;
    }

    if (this._isEmptyCell(next)) {
      gem.setPos(next);
      this._field[next] = this._field[cur];
      this._field[cur] = null;

      return true;
    }

    return false;
  }

  _isEmptyCell(i) {
    return this._isValidIndex(i) && this._field[i] == null;
  }

  _at(i) {
    return this._isValidIndex(i) ? this._field[i] : null;
  }

  _isValidIndex(i) {
    return i >= 0 && i < this._field.length;
  }

  _copyGems() {
    const pgems = new Set();
    const gems = [];

    this._gems.forEach((gem) => {
      const pgem = gem.parent();

      if (pgem && !pgems.has(pgem)) {
        pgems.add(pgem);
        gem
          .parent()
          .clone()
          .forEachGem((g) => gems.push(g));
      }

      if (!pgem) {
        gems.push(gem.clone());
      }
    });

    return gems;
  }

  _handleMoveInst(gems, cmd) {
    gems.forEach((gem, i) => {
      switch (cmd) {
        case 'L':
        case 'R':
          this._moveGem(gem, cmd);
          break;

        case 'A':
        case 'B':
          if (i > 0) {
            this._moveGem(gem, cmd);
          }
          break;

        default:
          throw new Error(`Bad move: ${cmd}`);
      }
    });
  }
}
