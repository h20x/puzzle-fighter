export class Gem {
  constructor(type, pos) {
    this._type = type;
    this._pos = pos;
  }

  type() {
    return this._type;
  }

  pos() {
    return { ...this._pos };
  }

  incLeft(val) {
    this._pos.left += val;
  }

  incTop(val) {
    this._pos.top += val;
  }

  clone() {
    return new Gem(this.type(), this.pos());
  }
}
