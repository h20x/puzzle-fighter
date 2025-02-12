import { Gem, PowerGem } from './gem.js';

const gemTypes = new Set(['R', 'G', 'B', 'Y', 'r', 'g', 'b', 'y', '0']);

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
    if (!this._checkEmptyCells()) {
      return this._history.slice();
    }

    this._clearHistory();
    const gems = this._createGems(inst);
    this._moveGems(inst, gems);
    this._landGems(gems);
    this._handleAllGems();

    return this._history.slice();
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

  getPowerGems() {
    const map = new Map();

    for (const gem of this._gems) {
      const parent = gem.parent();

      if (parent) {
        map.set(parent.pos(), `${parent.width()}x${parent.height()}`);
      }
    }

    return [...map];
  }

  _checkEmptyCells() {
    return [this._gemOffset, this._cols + this._gemOffset].every((i) =>
      this._isEmptyCell(i)
    );
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
    gems.sort((a, b) => a.pos() - b.pos());
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
        this._rotateGemACW(pair[1], pair[0]);
        break;

      case 'B':
        this._rotateGemCW(pair[1], pair[0]);
        break;

      default:
        throw new Error(`Bad move: ${cmd}`);
    }
  }

  _moveGemLeft(gem) {
    if (this._isSameRow(gem.pos(), gem.pos() - 1)) {
      return this._setGemPos(gem, gem.pos() - 1);
    }

    return false;
  }

  _moveGemRight(gem) {
    if (this._isSameRow(gem.pos(), gem.pos() + 1)) {
      return this._setGemPos(gem, gem.pos() + 1);
    }

    return false;
  }

  _moveGemDown(gem) {
    return this._setGemPos(gem, gem.pos() + this._cols);
  }

  _rotateGemCW(gem, anchor) {
    const gPos = gem.pos();
    const aPos = anchor.pos();
    const diff = gPos - aPos;

    // right
    if (diff === 1) {
      return this._setGemPos(gem, aPos + this._cols);
    }

    // bottom
    else if (diff === this._cols) {
      // shift right
      if (this._isLeftEdge(aPos) || !this._isEmptyCell(aPos - 1)) {
        this._moveGemRight(anchor);
        this._setGemPos(gem, aPos);
      } else {
        this._setGemPos(gem, aPos - 1);
      }
    }

    // left
    else if (diff === -1) {
      // shift down
      if (this._isTopEdge(aPos)) {
        this._moveGemDown(anchor);
        this._setGemPos(gem, aPos);
      } else {
        this._setGemPos(gem, aPos - this._cols);
      }
    }

    // top
    else {
      // shift left
      if (this._isRightEdge(aPos)) {
        this._moveGemLeft(anchor);
        this._setGemPos(gem, aPos);
      } else {
        this._setGemPos(gem, aPos + 1);
      }
    }
  }

  _rotateGemACW(gem, anchor) {
    const gPos = gem.pos();
    const aPos = anchor.pos();
    const diff = gPos - aPos;

    // left
    if (diff === -1) {
      return this._setGemPos(gem, aPos + this._cols);
    }

    // bottom
    else if (diff === this._cols) {
      // shift left
      if (this._isRightEdge(aPos) || !this._isEmptyCell(aPos + 1)) {
        this._moveGemLeft(anchor);
        this._setGemPos(gem, aPos);
      } else {
        this._setGemPos(gem, aPos + 1);
      }
    }

    // right
    else if (diff === 1) {
      // shift down
      if (this._isTopEdge(aPos)) {
        this._moveGemDown(anchor);
        this._setGemPos(gem, aPos);
      } else {
        this._setGemPos(gem, aPos - this._cols);
      }
    }

    // top
    else {
      // shift right
      if (this._isLeftEdge(aPos)) {
        this._moveGemRight(anchor);
        this._setGemPos(gem, aPos);
      } else {
        this._setGemPos(gem, aPos - 1);
      }
    }
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
      const gemsToSkip = new Set();

      for (let n = gems.length - 1; n >= 0; --n) {
        const pgem = gems[n].parent();

        if (pgem && !gemsToSkip.has(pgem)) {
          gemsToSkip.add(pgem);
          isUnstable = this._movePowerGemDown(pgem) || isUnstable;
        }

        if (!pgem) {
          isUnstable = this._moveGemDown(gems[n]) || isUnstable;
        }
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

      if (gem.isRainbow() && this._handleRainbowGem(gem)) {
        i = -1;
      }

      if (gem.isSimple()) {
        this._formPowerGem(gem);
      }
    }

    this._expandPowerGems();
    this._mergePowerGems();
  }

  _handleCrashGem(cgem) {
    const gemsToDestroy = this._findConnectedGems(cgem);

    if (gemsToDestroy.size > 1) {
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

    const pos = gem.pos();
    const gems = [
      this._isSameRow(pos, pos - 1) ? this._at(pos - 1) : null,
      this._isSameRow(pos, pos + 1) ? this._at(pos + 1) : null,
      this._at(pos - this._cols),
      this._at(pos + this._cols),
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

  _handleRainbowGem(rgem) {
    const gemBelow = this._at(rgem.pos() + this._cols);

    if (gemBelow) {
      const gemsToDestroy = this._gems.filter(
        (g) => g.color() === gemBelow.color()
      );
      gemsToDestroy.push(rgem);
      this._destroyGems(new Set(gemsToDestroy));
      this._landGems(this._gems);

      return true;
    }

    return false;
  }

  _formPowerGem(gem) {
    const lt = gem.pos();
    const rt = lt + 1;
    const lb = lt + this._cols;
    const rb = lb + 1;

    const gems = [
      gem,
      this._isSameRow(lt, rt) ? this._at(rt) : null,
      this._at(lb),
      this._isSameRow(lb, rb) ? this._at(rb) : null,
    ];

    const isEqual = gems.every(
      (g) => g && g.isSimple() && g.color() === gem.color()
    );

    if (isEqual) {
      const powerGem = new PowerGem(this._cols, gems);
      gems.forEach((gem) => gem.setParent(powerGem));
      this._expandPowerGemRight(powerGem);
      this._expandPowerGemBottom(powerGem);
      this._updateHistory();

      return true;
    }

    return false;
  }

  _expandPowerGems() {
    const gemsToSkip = new Set();

    for (const gem of this._gems) {
      const pgem = gem.parent();

      if (!pgem || gemsToSkip.has(pgem)) {
        continue;
      }

      gemsToSkip.add(pgem);
      this._expandPowerGem(pgem);
    }
  }

  _expandPowerGem(pgem) {
    const size = pgem.height() * pgem.width();

    this._expandPowerGemLeft(pgem);
    this._expandPowerGemRight(pgem);
    this._expandPowerGemTop(pgem);
    this._expandPowerGemBottom(pgem);

    if (size !== pgem.height() * pgem.width()) {
      this._updateHistory();
    }
  }

  _expandPowerGemLeft(pgem) {
    const gems = [];

    do {
      gems.length = 0;

      for (let i = 0; i < pgem.height(); ++i) {
        const idx = pgem.pos() + this._cols * i;

        if (this._isSameRow(idx, idx - 1)) {
          gems.push(this._at(idx - 1));
        }
      }
    } while (pgem.expand('H', gems));
  }

  _expandPowerGemRight(pgem) {
    const gems = [];

    do {
      gems.length = 0;

      for (let i = 0; i < pgem.height(); ++i) {
        const idx = pgem.pos() + (pgem.width() - 1) + i * this._cols;

        if (this._isSameRow(idx, idx + 1)) {
          gems.push(this._at(idx + 1));
        }
      }
    } while (pgem.expand('H', gems));
  }

  _expandPowerGemTop(pgem) {
    const gems = [];

    do {
      gems.length = 0;

      for (let i = 0; i < pgem.width(); ++i) {
        gems.push(this._at(pgem.pos() - this._cols + i));
      }
    } while (pgem.expand('V', gems));
  }

  _expandPowerGemBottom(pgem) {
    const gems = [];

    do {
      gems.length = 0;

      for (let i = 0; i < pgem.width(); ++i) {
        gems.push(this._at(pgem.pos() + this._cols * pgem.height() + i));
      }
    } while (pgem.expand('V', gems));
  }

  _mergePowerGems() {
    const gemsToSkip = new Set();

    for (const gem of this._gems) {
      const pgem = gem.parent();

      if (!pgem || gemsToSkip.has(pgem)) {
        continue;
      }

      gemsToSkip.add(pgem);
      this._mergePowerGem(pgem);
    }
  }

  _mergePowerGem(pgem) {
    const size = pgem.height() * pgem.width();

    while (pgem.merge('H', this._at(pgem.pos() + pgem.width())));
    while (pgem.merge('V', this._at(pgem.pos() + this._cols * pgem.height())));

    if (size !== pgem.height() * pgem.width()) {
      this._updateHistory();
    }
  }

  _movePowerGemDown(pgem) {
    const canMoveDown = Array.from(
      { length: pgem.width() },
      (_, i) => pgem.pos() + this._cols * pgem.height() + i
    ).every((pos) => this._isEmptyCell(pos));

    if (canMoveDown) {
      pgem
        .gems()
        .reverse()
        .forEach((gem) => this._moveGemDown(gem));

      return true;
    }

    return false;
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
    const gemsToSkip = new Set();
    const gems = [];

    for (const gem of this._gems) {
      const pgem = gem.parent();

      if (pgem && !gemsToSkip.has(pgem)) {
        gemsToSkip.add(pgem);
        pgem
          .clone()
          .gems()
          .forEach((g) => gems.push(g));
      }

      if (!pgem) {
        gems.push(gem.clone());
      }
    }

    return gems;
  }

  _isSameRow(i1, i2) {
    return Math.floor(i1 / this._cols) === Math.floor(i2 / this._cols);
  }

  _isRightEdge(pos) {
    return (pos + 1) % this._cols === 0;
  }

  _isLeftEdge(pos) {
    return pos % this._cols === 0;
  }

  _isTopEdge(pos) {
    return pos < this._cols;
  }
}
