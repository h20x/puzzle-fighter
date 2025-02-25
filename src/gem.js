export class Gem {
  constructor(type, pos) {
    this._type = type;
    this._pos = pos;
    this._color = type.toLowerCase();
    this._isCrash = 'rgby'.includes(type);
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

  isRainbow() {
    return this._type === '0';
  }

  isSimple() {
    return !this.parent() && !this.isCrash() && !this.isRainbow();
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

  area() {
    return this._width * this._height;
  }

  row() {
    return Math.floor(this.pos() / this._fieldWidth);
  }

  clone() {
    const gems = this._gems.map((gem) => gem.clone());
    const powerGem = new PowerGem(this._fieldWidth, gems);
    gems.forEach((gem) => gem.setParent(powerGem));

    return powerGem;
  }

  gems() {
    return this._gems.slice();
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

  merge(dir, gem) {
    if (!gem) {
      return false;
    }

    const pgem = gem.parent();

    if (!pgem || pgem === this || pgem.color() !== this.color()) {
      return false;
    }

    if (dir === 'H' && !this._canMergeHor(pgem)) {
      return false;
    }

    if (dir === 'V' && !this._canMergeVer(pgem)) {
      return false;
    }

    pgem.gems().forEach((g) => {
      g.setParent(this);
      this._gems.push(g);
    });

    this._updateProps();

    return true;
  }

  isCrash() {
    return false;
  }

  isRainbow() {
    return false;
  }

  isSimple() {
    return false;
  }

  _canMergeHor(pgem) {
    const isNeighbour =
      pgem.pos() + pgem.width() === this.pos() ||
      this.pos() + this.width() === pgem.pos();

    return (
      isNeighbour &&
      pgem.row() === this.row() &&
      pgem.height() === this.height()
    );
  }

  _canMergeVer(pgem) {
    return (
      pgem.pos() === this.pos() + this._fieldWidth * this.height() &&
      pgem.width() === this.width()
    );
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
