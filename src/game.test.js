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

  it('rainbow gems should destroy all gems that match the color', () => {
    [
      [
        [
          ['BB', 'ALLL'],
          ['BR', 'AL'],
          ['GR', 'R'],
          ['RR', 'LL'],
          ['GR', 'L'],
          ['RR', 'LR'],
          ['RR', 'R'],
          ['RR', 'R'],
          ['RR', 'L'],
          ['0G', 'LL'],
        ],
        ['    R', '  R R', ' RRRR', ' RRRR', 'BBBRR'],
        [[55, '4x2']],
      ],
      [
        [
          ['BB', 'ALLL'],
          ['BR', 'AL'],
          ['GR', 'R'],
          ['RR', 'LL'],
          ['GR', 'L'],
          ['RR', 'LR'],
          ['RR', 'R'],
          ['RR', 'R'],
          ['RR', 'L'],
          ['0G', 'LL'],
          ['00', 'RR'],
          ['R0', 'LL'],
        ],
        ['BBB'],
        [],
      ],
    ].forEach(([instuctions, state, pgems]) => {
      const game = createGame();
      instuctions.forEach((inst) => game.exec(inst));

      expect(game.getStateStr()).toBe(createStateStr(state));
      expect(game.getPowerGems()).toEqual(pgems);
    });
  });

  it('should consider the width of the field when searching for adjacent gems', () => {
    [
      [
        [
          ['BB', 'AR'],
          ['GG', 'LLL'],
          ['GG', 'RR'],
        ],
        ['     G', 'G    G', 'G   BB'],
        [],
      ],
      [
        [
          ['BB', 'AR'],
          ['GG', 'LLL'],
          ['GG', 'RR'],
          ['GG', 'R'],
        ],
        ['    GG', 'G   GG', 'G   BB'],
        [[58, '2x2']],
      ],
      [
        [
          ['BB', 'AR'],
          ['GG', 'LLL'],
          ['GG', 'RR'],
          ['GG', 'LL'],
        ],
        ['     G', 'GG   G', 'GG  BB'],
        [[60, '2x2']],
      ],
      [
        [
          ['BB', 'AR'],
          ['Rg', 'AR'],
          ['GG', 'ALLL'],
        ],
        ['    Rg', 'GG  BB'],
        [],
      ],
      [
        [
          ['BB', 'ALLL'],
          ['Rg', 'BLL'],
          ['GG', 'AR'],
          ['GG', 'RR'],
        ],
        ['     G', 'gR   G', 'BB  GG'],
        [],
      ],
    ].forEach(([instuctions, state, pgems]) => {
      const game = createGame();
      instuctions.forEach((inst) => game.exec(inst));

      expect(game.getStateStr()).toBe(createStateStr(state));
      expect(game.getPowerGems()).toEqual(pgems);
    });
  });

  it('power gem should move down as one unit', () => {
    const game = createGame();

    [
      ['BB', 'ALL'],
      ['BB', 'ALL'],
      ['GG', 'RL'],
      ['RR', 'AL'],
      ['RR', 'AL'],
      ['YY', 'AL'],
      ['YY', 'AL'],
      ['BB', 'RL'],
      ['0G', 'R'],
      ['0R', 'R'],
    ].forEach((inst) => game.exec(inst));

    expect(game.getStateStr()).toBe(
      createStateStr(['   B', '   B', '  YY', '  YY', ' BB', ' BB'])
    );
    expect(game.getPowerGems()).toEqual([
      [50, '2x2'],
      [61, '2x2'],
    ]);
  });
});
