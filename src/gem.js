export class Gem {
  constructor(type, pos) {
    this._type = type;
    this._pos = pos;
    this._parent = null;
  }

  color() {
    return this._type.toLowerCase();
  }

  type() {
    return this._type;
  }

  pos() {
    return this._pos;
  }

  width() {
    return 1;
  }

  height() {
    return 1;
  }

  parent() {
    return this._parent;
  }

  setPos(val) {
    this._pos = val;
  }

  setParent(powerGem) {
    this._parent = powerGem;
  }

  clone() {
    return new Gem(this.type(), this.pos());
  }

  isEqual(gem) {
    return gem && this._type == gem.type();
  }

  isCrash() {
    return 'rgb'.indexOf(this._type) >= 0;
  }

  isSimple() {
    return !this.parent() && !this.isCrash();
  }
}

export class PowerGem {
  constructor(fieldWidth, gems) {
    this._fieldWidth = fieldWidth;
    this._width = 0;
    this._height = 0;
    this._gems = gems.slice();
    this._checkGemsLength();
    this._updateProps();
  }

  type() {
    return this._gems[0].type();
  }

  pos() {
    return this._gems[0].pos();
  }

  width() {
    return this._width;
  }

  height() {
    return this._height;
  }

  forEachGem(cb) {
    this._gems.forEach(cb);
  }

  expand(dir, gems) {
    const size = dir === 'H' ? this._height : this._width;

    if (gems.length !== size) {
      return false;
    }

    if (!this._gems.every((gem) => this._canConsume(gem))) {
      return false;
    }

    this._gems.push(...gems);
    this._updateProps();

    return true;
  }

  clone() {
    const gems = this._gems.map((gem) => gem.clone());
    const powerGem = new PowerGem(this._fieldWidth, gems);
    gems.forEach((gem) => gem.setParent(powerGem));

    return powerGem;
  }

  _canConsume(gem) {
    return gem && !gem.parent() && gem.type() === this.type();
  }

  _updateProps() {
    this._gems.sort((a, b) => a.pos() - b.pos());
    const colStart = this._gems[0].pos() % this._fieldWidth;
    const colEnd = this._gems[this._gems.length - 1].pos() % this._fieldWidth;
    this._width = colEnd - colStart + 1;
    this._height = this._gems.length / this._width;
  }

  _checkGemsLength() {
    const len = this._gems.length;
    const isEven = !(len & 1);
    const isSquare = Math.pow(Math.sqrt(len) | 0, 2) === len;

    if ((isEven && len > 2) || isSquare) {
      return;
    }

    throw new Error(`Power Gem. Wrong number of gems: ${len}`);
  }
}
