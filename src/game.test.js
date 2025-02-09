import { Game } from './game';

describe('Game', () => {
  const ncols = 6;
  const nrows = 12;

  function createStateStr(rows) {
    const state = new Array(nrows - rows.length).fill(' '.repeat(ncols));
    rows.forEach((row) => state.push(row.padEnd(ncols, ' ')));

    return state.join('\n');
  }

  function createGame() {
    return new Game(ncols, nrows);
  }

  it('should handle simple gems', () => {
    const game = createGame();

    [
      ['BR', 'ABBABAAB'],
      ['RR', 'LLL'],
      ['RR', 'LL'],
      ['RB', 'A'],
      ['BG', 'LB'],
      ['GG', 'RR'],
      ['BB', 'BLLRRR'],
    ].forEach((inst) => game.exec(inst));

    expect(game.getStateStr()).toBe(
      createStateStr(['   B', ' G R', 'RR BBG', 'RRBRBG'])
    );
  });

  it('should handle crash gems and form power gems', () => {
    [
      [
        [
          ['BB', 'BLL'],
          ['RR', 'B'],
          ['GG', 'BLL'],
          ['RG', 'B'],
          ['RG', 'BLL'],
          ['GG', 'LLL'],
          ['RR', 'L'],
          ['Rg', 'LL'],
        ],
        [' RR', ' RRR', 'BBRR'],
        [[55, '2x2']],
      ],
      [
        [
          ['BR', 'ALLL'],
          ['RR', 'AL'],
          ['GG', 'ALLL'],
          ['GR', 'AL'],
          ['GR', 'ALLL'],
          ['GG', 'LLL'],
          ['RR', 'L'],
          ['Rg', 'LL'],
        ],
        [' RR', ' RRR', 'BRRR'],
        [[55, '2x3']],
      ],
    ].forEach(([instuctions, state, pgems]) => {
      const game = createGame();
      instuctions.forEach((inst) => game.exec(inst));

      expect(game.getStateStr()).toBe(createStateStr(state));
      expect(game.getPowerGems()).toEqual(pgems);
    });
  });

  it('power gems should expand', () => {
    [
      [
        [
          ['RR', 'ALLL'],
          ['RG', 'AL'],
          ['RR', 'ALLL'],
          ['GG', 'AL'],
          ['GG', 'ALLL'],
          ['RR', 'ALLL'],
          ['RG', 'L'],
          ['Bg', 'LR'],
        ],
        ['RR', 'RRR', 'RRRB'],
        [[60, '3x2']],
      ],
      [
        [
          ['BR', 'ALLL'],
          ['RR', 'AL'],
          ['GG', 'ALLL'],
          ['GR', 'AL'],
          ['GR', 'ALLL'],
          ['GG', 'LLL'],
          ['RR', 'L'],
          ['Rg', 'LL'],
        ],
        [' RR', ' RRR', 'BRRR'],
        [[55, '2x3']],
      ],
    ].forEach(([instuctions, state, pgems]) => {
      const game = createGame();
      instuctions.forEach((inst) => game.exec(inst));

      expect(game.getStateStr()).toBe(createStateStr(state));
      expect(game.getPowerGems()).toEqual(pgems);
    });
  });

  it('power gems should merge', () => {
    const game = createGame();

    [
      ['RR', 'ALLL'],
      ['RR', 'AL'],
      ['RR', 'ALLL'],
      ['GG', 'AL'],
      ['RR', 'AR'],
      ['RR', 'AR'],
      ['RR', 'AR'],
      ['GG', 'ALLL'],
      ['GG', 'AL'],
      ['RR', 'AL'],
      ['GG', 'AL'],
      ['RR', 'AL'],
      ['GG', 'ALLL'],
      ['GG', 'ALLL'],
      ['Bg', 'LLL'],
    ].forEach((inst) => game.exec(inst));

    expect(game.getStateStr()).toBe(
      createStateStr(['B RRRR', 'RRRRRR', 'RRRRRR'])
    );
    expect(game.getPowerGems()).toEqual([
      [56, '4x3'],
      [60, '2x2'],
    ]);
  });
});
