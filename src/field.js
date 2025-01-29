export class Field {
  constructor(width, height, parent) {
    this._width = width;
    this._height = height;
    this._parent = parent;
    this._field = null;
  }

  render(state) {
    if (!this._field) {
      this._field = document.createElement('div');
      this._field.classList.add('field');
      this._field.style.setProperty('--width', this._width);
      this._field.style.setProperty('--height', this._height);
      this._parent.append(this._field);
    }

    this._field.innerHTML = this._createHTML(state);
  }

  _createHTML(state) {
    const len = this._width * this._height;
    let html = '';

    for (let i = 0; i < len; ++i) {
      if (state && state[i]) {
        // gem
        html += `<div class="cell"></div>`;
      } else {
        html += `<div class="cell"></div>`;
      }
    }

    return html;
  }
}
