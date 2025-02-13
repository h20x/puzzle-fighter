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

  function runTest(instuctions, state, pgems) {
    const game = createGame();
    instuctions.forEach((inst) => game.exec(inst));
    expect(game.getStateStr()).toBe(createStateStr(state));

    if (pgems) {
      expect(game.getPowerGems()).toEqual(pgems);
    }
  }

  it('should handle simple gems', () => {
    runTest(
      [
        ['BR', 'ABBABAAB'],
        ['RR', 'LLL'],
        ['RR', 'LL'],
        ['RB', 'A'],
        ['BG', 'LB'],
        ['GG', 'RR'],
        ['BB', 'BLLRRR'],
      ],
      ['   B', ' G R', 'RR BBG', 'RRBRBG']
    );
  });

  it('should handle crash gems and form power gems', () => {
    runTest(
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
      [[55, '2x2']]
    );

    runTest(
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
      [[55, '2x3']]
    );

    runTest(
      [
        ['RG', 'ALLL'],
        ['GB', 'ALLL'],
        ['GG', 'ALLL'],
        ['RG', 'LLL'],
        ['BB', 'AL'],
        ['Gb', 'ALL'],
      ],
      ['R', 'GG', 'GG', 'G', 'RG'],
      [[48, '2x2']]
    );
  });

  it('power gems should expand', () => {
    runTest(
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
      [[60, '3x2']]
    );

    runTest(
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
      [[55, '2x3']]
    );
  });

  it('power gems should merge', () => {
    runTest(
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
      ],
      ['B RRRR', 'RRRRRR', 'RRRRRR'],
      [
        [56, '4x3'],
        [60, '2x2'],
      ]
    );
  });

  it('rainbow gems should destroy all gems that match the color', () => {
    runTest(
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
      [[55, '4x2']]
    );

    runTest(
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
      []
    );
  });

  it('should consider the width of the field when searching for adjacent gems', () => {
    runTest(
      [
        ['BB', 'AR'],
        ['GG', 'LLL'],
        ['GG', 'RR'],
      ],
      ['     G', 'G    G', 'G   BB']
    );

    runTest(
      [
        ['BB', 'AR'],
        ['GG', 'LLL'],
        ['GG', 'RR'],
        ['GG', 'R'],
      ],
      ['    GG', 'G   GG', 'G   BB'],
      [[58, '2x2']]
    );

    runTest(
      [
        ['BB', 'AR'],
        ['GG', 'LLL'],
        ['GG', 'RR'],
        ['GG', 'LL'],
      ],
      ['     G', 'GG   G', 'GG  BB'],
      [[60, '2x2']]
    );

    runTest(
      [
        ['BB', 'AR'],
        ['Rg', 'AR'],
        ['GG', 'ALLL'],
      ],
      ['    Rg', 'GG  BB']
    );

    runTest(
      [
        ['BB', 'ALLL'],
        ['Rg', 'BLL'],
        ['GG', 'AR'],
        ['GG', 'RR'],
      ],
      ['     G', 'gR   G', 'BB  GG']
    );
  });

  it('power gem should move down as one unit', () => {
    runTest(
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
      ],
      ['   B', '   B', '  YY', '  YY', ' BB', ' BB'],
      [
        [50, '2x2'],
        [61, '2x2'],
      ]
    );
  });

  it('horizontal movement should be limited to the boundaries of the field', () => {
    runTest(
      [
        ['BB', 'RRRR'],
        ['BB', 'LLLLLL'],
      ],
      ['B    B', 'B    B']
    );
  });

  it('should not add new gems if there is no space left', () => {
    runTest(
      [
        ['BB', 'RL'],
        ['BB', 'RL'],
        ['BB', 'RL'],
        ['BB', 'RL'],
        ['BB', 'RL'],
        ['BB', 'RL'],
        ['GG', 'RL'],
        ['RR', 'RL'],
        ['YY', 'RL'],
      ],
      [
        '   B',
        '   B',
        '   B',
        '   B',
        '   B',
        '   B',
        '   B',
        '   B',
        '   B',
        '   B',
        '   B',
        '   B',
      ]
    );
  });

  it('rotation should cause a shift', () => {
    runTest(
      [
        ['RG', 'RRAAAAAA'],
        ['BG', 'LLLAAAAAA'],
        ['YG', 'LLLBBBBR'],
        ['YG', 'RRBBBBRABBR'],
        ['RR', 'L'],
        ['RR', 'L'],
        ['RR', 'L'],
        ['RR', 'L'],
        ['RR', 'L'],
        ['BY', 'BBAAA'],
        ['BB', 'R'],
        ['BB', 'R'],
        ['BB', 'R'],
        ['BB', 'R'],
        ['BY', 'BBAAA'],
      ],
      [
        '  R B ',
        '  R B ',
        '  R B ',
        '  R B ',
        '  R B ',
        '  R B ',
        '  R B ',
        '  R B ',
        '  R B ',
        '  R G ',
        ' GYBGY',
        ' BGYRY',
      ]
    );
  });

  it('complex tests', () => {
    runTest(
      [
        ['BB', 'ALLL'],
        ['BB', 'AL'],
        ['RR', 'AR'],
        ['BB', 'ALLL'],
        ['BB', 'AL'],
        ['RR', 'AR'],
        ['BB', 'ALLL'],
        ['BB', 'AL'],
        ['BB', 'ALLL'],
        ['BB', 'AL'],
        ['RY', 'AR'],
        ['YY', 'AR'],
        ['YY', 'AR'],
        ['GG', 'ALLL'],
        ['GG', 'ALLL'],
        ['GG', 'ALLL'],
        ['YY', 'AL'],
        ['RR', 'AR'],
        ['RR', 'AR'],
        ['GG', 'LLL'],
        ['Yb', 'AR'],
        ['GB', 'ALL'],
        ['Ry', 'RL'],
      ],
      [
        'G     ',
        'GG    ',
        'GG    ',
        'GG  Yb',
        'GGBRRR',
        'BBBBRR',
        'BBBBR ',
        'BBBBRR',
        'BBBBRR',
      ],
      [
        [24, '2x4'],
        [46, '2x2'],
        [48, '4x4'],
        [64, '2x2'],
      ]
    );

    runTest(
      [
        ['BR', 'LLL'],
        ['BY', 'LL'],
        ['BG', 'ALL'],
        ['BY', 'BRR'],
        ['RR', 'AR'],
        ['GY', 'A'],
        ['BB', 'AALLL'],
        ['GR', 'A'],
        ['RY', 'LL'],
        ['GG', 'L'],
        ['GY', 'BB'],
        ['bR', 'ALLL'],
        ['gy', 'AAL'],
      ],
      ['    R', ' R  YR', 'RR  RB']
    );

    runTest(
      [
        ['GR', 'ALLL'],
        ['GG', 'ALLL'],
        ['RG', 'AAL'],
        ['RB', 'BLL'],
        ['RG', 'ALL'],
        ['BB', 'RR'],
        ['BR', 'BB'],
        ['BR', 'ALLL'],
        ['YB', 'R'],
        ['BG', 'BBRR'],
        ['YR', 'AAR'],
        ['RR', 'L'],
        ['RR', 'ABLL'],
        ['GY', 'BRR'],
        ['BB', 'R'],
        ['gB', 'RR'],
        ['BR', 'ALL'],
        ['Gr', 'BB'],
        ['Rb', 'R'],
        ['GG', 'B'],
        ['bB', 'LL'],
      ],
      ['    R', '  GGY', '  GGYB', 'GGGRYB', 'GRRBBB']
    );

    runTest(
      [
        ['RR', 'LLL'],
        ['GG', 'LL'],
        ['RG', 'BBL'],
        ['GY', 'AR'],
        ['RR', 'BBLLL'],
        ['RB', 'AALL'],
        ['GR', 'B'],
        ['GB', 'AR'],
        ['RR', ''],
        ['GG', 'R'],
        ['YR', 'BR'],
        ['RR', 'LLL'],
        ['BR', 'AALL'],
        ['Bg', ''],
        ['RR', 'BBBBLLL'],
        ['GR', 'ALLL'],
        ['bR', 'L'],
        ['YG', 'BBBALL'],
        ['RR', 'L'],
        ['YB', 'AL'],
      ],
      [
        'GG',
        'RY',
        'RRYB',
        'RRRB',
        'R RgY',
        'R RRG',
        'RRRRG',
        'RGGRGB',
        'RGRGGY',
      ]
    );

    runTest(
      [
        ['BB', 'LLLL'],
        ['BB', 'LL'],
        ['BB', 'L'],
        ['BB', 'LLL'],
        ['BB', 'LL'],
        ['BG', 'L'],
        ['BB', ''],
        ['BB', 'R'],
        ['RB', 'BBRRR'],
        ['RR', 'LLL'],
        ['RR', 'BALL'],
        ['RR', ''],
        ['RR', 'R'],
        ['RR', 'L'],
        ['RR', 'B'],
        ['RR', 'LLL'],
        ['RR', 'LL'],
        ['RR', 'BLLL'],
        ['RR', 'B'],
        ['YR', 'ALL'],
        ['GR', 'AL'],
        ['Rb', 'RRRR'],
      ],
      [' YG', 'RRR', 'RRR', 'RRRR', 'RRRR', 'RRRR', '   RRR', '  GRRR'],
      [
        [30, '3x3'],
        [48, '4x2'],
        [63, '3x2'],
      ]
    );
  });
});
