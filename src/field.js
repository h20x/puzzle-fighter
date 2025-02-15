export class Field {
  constructor(cols, rows, parent) {
    this._cols = cols;
    this._rows = rows;
    this._parent = parent;
    this._field = null;
  }

  render(gems = []) {
    if (!this._field) {
      this._field = document.createElement('div');
      this._field.classList.add('field');
      this._field.style.setProperty('--cols', this._cols);
      this._field.style.setProperty('--rows', this._rows);
      this._parent.append(this._field);
    }

    this._field.innerHTML = this._createHTML(gems);
  }

  _createHTML(gems) {
    let html = '';

    html += `<div class="scale">
      ${'<div class="scale-item"></div>'.repeat(this._rows)}
    </div>`;

    html += `<div class="vlines">
      ${'<div class="line"></div>'.repeat(this._cols - 1)}
    </div>`;

    html += `<div class="hlines">
      ${'<div class="line"></div>'.repeat(this._rows - 1)}
    </div>`;

    const pgems = new Set();

    gems.forEach((gem) => {
      const pgem = gem.parent();

      if (pgem && !pgems.has(pgem)) {
        pgems.add(pgem);
        html += this._createGem(pgem);
      }

      if (!pgem) {
        html += this._createGem(gem);
      }
    });

    return html;
  }

  _createGem(gem) {
    const cls = ['gem', `gem--${gem.color()}`];

    if (gem.isCrash()) {
      cls.push('gem--crash');
    } else if (gem.isRainbow()) {
      cls.push('gem--rainbow');
    } else if (gem.isSimple()) {
      cls.push('gem--simple');
    } else {
      cls.push('gem--power');
    }

    const col = gem.pos() % this._cols;
    const row = (gem.pos() / this._cols) | 0;
    const clsStr = cls.join(' ');
    const style = [
      `--col: ${String(col)}`,
      `--row: ${String(row)}`,
      `--width: ${String(gem.width())}`,
      `--height: ${String(gem.height())}`,
    ].join('; ');

    if (gem.isCrash() || gem.isRainbow()) {
      return `<div class="${clsStr}" style="${style}"></div>`;
    }

    return `<div class="${clsStr}" style="${style}">
      <div class="gem__t"></div>
      <div class="gem__m"></div>
      <div class="gem__b"></div>
    </div>`;
  }
}
