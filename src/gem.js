export class Gem {
  constructor(type, pos) {
    this._type = type;
    this._pos = pos;
    this._color = type.toLowerCase();
    this._isCrash = 'rgb'.includes(type);
    this._parent = null;
  }

  type() {
    return this._type;
  }

  color() {
    return this._color;
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

  clone() {
    return new Gem(this.type(), this.pos());
  }

  setPos(val) {
    this._pos = val;
  }

  setParent(powerGem) {
    this._parent = powerGem;
  }

  isCrash() {
    return this._isCrash;
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

  color() {
    return this._gems[0].color();
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

  clone() {
    const gems = this._gems.map((gem) => gem.clone());
    const powerGem = new PowerGem(this._fieldWidth, gems);
    gems.forEach((gem) => gem.setParent(powerGem));

    return powerGem;
  }

  forEachGem(cb) {
    this._gems.forEach(cb);
  }

  expand(dir, gems) {
    const size = dir === 'H' ? this._height : this._width;

    if (gems.length !== size) {
      return false;
    }

    if (!gems.every((gem) => this._canConsume(gem))) {
      return false;
    }

    for (let gem of gems) {
      gem.setParent(this);
      this._gems.push(gem);
    }

    this._updateProps();

    return true;
  }

  _canConsume(gem) {
    return gem && gem.isSimple() && gem.color() === this.color();
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
