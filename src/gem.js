export class Gem {
  constructor(type, pos) {
    this._type = type;
    this._pos = pos;
  }

  type() {
    return this._type;
  }

  pos() {
    return this._pos;
  }

  setPos(val) {
    this._pos = val;
  }

  clone() {
    return new Gem(this.type(), this.pos());
  }
}
