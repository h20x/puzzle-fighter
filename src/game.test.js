import { Game } from './game';

describe('Game', () => {
  const ncols = 6;
  const nrows = 12;

  function createStateStr(rows) {
    const state = new Array(nrows - rows.length).fill(' '.repeat(ncols));
    rows.forEach((row) => state.push(row.padEnd(ncols, ' ')));

    return state.join('\n');
  }

  it('should handle simple gems', () => {
    const game = new Game(ncols, nrows);

    [
      ['BR', 'LLL'],
      ['RG', 'LL'],
      ['RB', 'A'],
      ['BG', 'LB'],
      ['GG', 'RR'],
    ].forEach((inst) => game.exec(inst));

    expect(game.getStateStr()).toBe(createStateStr([' G', 'BR   G', 'RGBRBG']));
  });
});
