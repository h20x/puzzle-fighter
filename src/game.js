import { Gem, PowerGem } from './gem.js';

const gemTypes = new Set(['R', 'G', 'B', 'r', 'g', 'b']);

export class Game {
  constructor(cols, rows, gemOffset = 3) {
    this._cols = cols;
    this._rows = rows;
    this._gemOffset = gemOffset;
    this._field = new Array(cols * rows).fill(null);
    this._gems = [];
    this._history = [];
  }

  exec(inst) {
    this._clearHistory();
    const gems = this._createGems(inst);
    this._moveGems(inst, gems);
    this._landGems(gems);
    this._handleAllGems();

    return this._history;
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

  _createGems(inst) {
    const [types] = inst;
    const gems = types.split('').map((type, i) => {
      if (!gemTypes.has(type)) {
        console.error(`Instruction: ${inst}. Bad gem type: ${type}`);
      }

      return this._addGem(new Gem(type, this._cols * i + this._gemOffset));
    });

    this._updateHistory();

    return gems;
  }

  _addGem(gem) {
    this._field[gem.pos()] = gem;
    this._gems.push(gem);

    return gem;
  }

  _moveGems(inst, gems) {
    const [, moves] = inst;
    moves.split('').forEach((move) => {
      try {
        this._handleMoveInst(gems, move);
        this._updateHistory();
      } catch (err) {
        console.error(`Instruction: ${inst}. ${err.message}`);
      }
    });
  }

  _handleMoveInst(pair, cmd) {
    switch (cmd) {
      case 'L':
        pair
          .slice()
          .sort((a, b) => a.pos() - b.pos())
          .forEach((gem) => this._moveGemLeft(gem));
        break;

      case 'R':
        pair
          .slice()
          .sort((a, b) => b.pos() - a.pos())
          .forEach((gem) => this._moveGemRight(gem));
        break;

      case 'A':
        this._rotateGemACW(pair[1], pair[0].pos());
        break;

      case 'B':
        this._rotateGemCW(pair[1], pair[0].pos());
        break;

      default:
        throw new Error(`Bad move: ${cmd}`);
    }
  }

  _moveGemLeft(gem) {
    return this._setGemPos(gem, gem.pos() - 1);
  }

  _moveGemRight(gem) {
    return this._setGemPos(gem, gem.pos() + 1);
  }

  _moveGemDown(gem) {
    return this._setGemPos(gem, gem.pos() + this._cols);
  }

  _rotateGemCW(gem, point) {
    if (gem.pos() - point === 1) {
      return this._setGemPos(gem, gem.pos() + this._cols - 1);
    }

    return this._setGemPos(gem, gem.pos() - this._cols - 1);
  }

  _rotateGemACW(gem, point) {
    if (gem.pos() - point === -1) {
      return this._setGemPos(gem, gem.pos() + this._cols + 1);
    }

    return this._setGemPos(gem, gem.pos() - this._cols + 1);
  }

  _setGemPos(gem, pos) {
    if (this._isEmptyCell(pos)) {
      this._field[pos] = gem;
      this._field[gem.pos()] = null;
      gem.setPos(pos);

      return true;
    }

    return false;
  }

  _landGems(gems) {
    let isUnstable = true;

    while (isUnstable) {
      isUnstable = false;

      for (let n = gems.length - 1; n >= 0; --n) {
        isUnstable = this._moveGemDown(gems[n]) || isUnstable;
      }

      if (isUnstable) {
        this._updateHistory();
      }
    }

    this._gems.sort((a, b) => a.pos() - b.pos());
  }

  _handleAllGems() {
    for (let i = 0; i < this._gems.length; ++i) {
      const gem = this._gems[i];

      if (gem.isCrash() && this._handleCrashGem(gem)) {
        i = -1;
      }

      if (gem.isSimple() && this._formPowerGem(gem)) {
        this._updateHistory();
      }
    }
  }

  _handleCrashGem(gem) {
    const gemsToDestroy = this._findConnectedGems(gem);

    if (gemsToDestroy.size > 0) {
      gemsToDestroy.add(gem);
      this._destroyGems(gemsToDestroy);
      this._landGems(this._gems);

      return true;
    }

    return false;
  }

  _findConnectedGems(gem, foundGems = new Set()) {
    if (foundGems.has(gem)) {
      return foundGems;
    }

    foundGems.add(gem);

    const gems = [
      this._at(gem.pos() - 1),
      this._at(gem.pos() + 1),
      this._at(gem.pos() - this._cols),
      this._at(gem.pos() + this._cols),
    ];

    for (const g of gems) {
      if (g && g.color() === gem.color()) {
        this._findConnectedGems(g, foundGems);
      }
    }

    return foundGems;
  }

  _destroyGems(gems) {
    this._gems = this._gems.filter((g) => {
      if (gems.has(g)) {
        this._field[g.pos()] = null;

        return false;
      }

      return true;
    });

    this._updateHistory();
  }

  _formPowerGem(gem) {
    const gems = [
      gem,
      this._at(gem.pos() + 1),
      this._at(gem.pos() + this._cols),
      this._at(gem.pos() + this._cols + 1),
    ];
    const isEqual = gems.every(
      (g) => g && g.isSimple() && g.color() === gem.color()
    );

    if (isEqual) {
      const powerGem = new PowerGem(this._cols, gems);
      gems.forEach((gem) => gem.setParent(powerGem));
      this._expandPGRight(powerGem);
      this._expandPGBottom(powerGem);

      return true;
    }

    return false;
  }

  _expandPGRight(pgem) {
    const gems = [];

    do {
      gems.length = 0;

      for (let i = 0; i < pgem.height(); ++i) {
        gems.push(this._at(pgem.pos() + pgem.width() + i * this._cols));
      }
    } while (pgem.expand('H', gems));
  }

  _expandPGBottom(pgem) {
    const gems = [];

    do {
      gems.length = 0;

      for (let i = 0; i < pgem.width(); ++i) {
        gems.push(this._at(pgem.pos() + pgem.height() + i));
      }
    } while (pgem.expand('V', gems));
  }

  _isEmptyCell(i) {
    return i >= 0 && i < this._field.length && this._field[i] == null;
  }

  _at(i) {
    return i >= 0 && i < this._field.length ? this._field[i] : null;
  }

  _clearHistory() {
    this._history.length = 0;
  }

  _updateHistory() {
    this._history.push(this._copyGems());
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
}
