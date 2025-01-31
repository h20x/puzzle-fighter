export class Field {
  constructor(cols, rows, parent) {
    this._cols = cols;
    this._rows = rows;
    this._parent = parent;
    this._field = null;
  }

  render(state) {
    if (!this._field) {
      this._field = document.createElement('div');
      this._field.classList.add('field');
      this._field.style.setProperty('--cols', this._cols);
      this._field.style.setProperty('--rows', this._rows);
      this._parent.append(this._field);
    }

    this._field.innerHTML = this._createHTML(state);
  }

  _createHTML(state) {
    const len = this._cols * this._rows;
    let html = '';

    for (let i = 0; i < len; ++i) {
      if (state && state[i]) {
        html += `<div class="cell">${this._createGem(state[i].type())}</div>`;
      } else {
        html += `<div class="cell"></div>`;
      }
    }

    return html;
  }

  _createGem(type) {
    const cls = ['gem'];
    cls.push(type.toLowerCase());

    if (type === 'r' || type === 'g' || type === 'b') {
      cls.push('crash');
    } else {
      cls.push('simple');
    }

    return `<div class="${cls.join(' ')}"></div>`;
  }
}
