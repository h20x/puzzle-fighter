import { Game } from './game';

describe('Game', () => {
  function createStateStr(rows, nrows, ncols) {
    const state = new Array(nrows - rows.length).fill(' '.repeat(ncols));
    rows.forEach((row) => state.push(row.padEnd(ncols, ' ')));

    return state.slice(2).join('\n');
  }

  function runTest(instructions, state, pgems) {
    const game = new Game();
    instructions.forEach((inst) => game.exec(inst));
    expect(game.getStateStr()).toBe(
      createStateStr(state, game.rows(), game.cols())
    );

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
      [[67, '2x2']]
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
      [[67, '2x3']]
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
      [[60, '2x2']]
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
      [[72, '3x2']]
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
      [[67, '2x3']]
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
        [68, '4x3'],
        [72, '2x2'],
      ]
    );

    runTest(
      [
        ['BB', 'LLL'],
        ['BB', 'LL'],
        ['BB', 'L'],
        ['BB', ''],
        ['GG', 'ALLL'],
        ['GG', 'AL'],
        ['BB', 'LLL'],
        ['BB', 'LL'],
        ['GG', 'ALLL'],
        ['BB', 'LLL'],
        ['BB', 'LL'],
        ['GG', 'AL'],
        ['GG', 'AL'],
        ['GG', 'AL'],
        ['GG', 'AL'],
        ['BB', 'AL'],
        ['BB', 'AL'],
        ['BB', 'AL'],
        ['BB', 'AL'],
        ['GG', 'R'],
        ['gg', 'R'],
      ],
      ['BBBB', 'BBBB', 'BBBB', 'BBBB', 'BBBB', 'BBBB'],
      [[48, '4x6']]
    );

    runTest(
      [
        ['BR', 'L'],
        ['RB', 'LR'],
        ['BR', 'LRR'],
        ['RB', 'LRRR'],
        ['GG', 'LA'],
        ['GG', 'LA'],
        ['GG', 'LA'],
        ['GG', 'ALRR'],
        ['GG', 'ALRR'],
        ['RR', 'LA'],
        ['RR', 'LA'],
        ['RR', 'LA'],
        ['RR', 'LA'],
        ['GG', 'LA'],
        ['RR', 'ALRR'],
        ['RR', 'ALRR'],
        ['GG', 'ALRR'],
        ['GG', 'ALRR'],
        ['Rr', 'R'],
      ],
      ['  GGGG', '  GGGG', '  GGGG', '  GGGG', '  BRBR', '  RBRB'],
      [[50, '4x4']]
    );
  });

  it('power gems should only merge with gems in the same row', () => {
    runTest(
      [
        ['RR', 'AR'],
        ['RR', 'AR'],
        ['GG', 'AR'],
        ['GG', 'AR'],
        ['RR', 'BLL'],
        ['GG', 'BLL'],
        ['GG', 'BLL'],
      ],
      ['    GG', 'GG  GG', 'GG  RR', 'RR  RR'],
      [
        [64, '2x2'],
        [66, '2x2'],
        [76, '2x2'],
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
      [[67, '4x2']]
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

    runTest([['0R', '']], []);
    runTest([['00', '']], []);
    runTest([['R0', '']], ['   R']);
    runTest(
      [
        ['RR', 'A'],
        ['BB', 'A'],
        ['00', ''],
      ],
      ['   RR']
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
      [[70, '2x2']]
    );

    runTest(
      [
        ['BB', 'AR'],
        ['GG', 'LLL'],
        ['GG', 'RR'],
        ['GG', 'LL'],
      ],
      ['     G', 'GG   G', 'GG  BB'],
      [[72, '2x2']]
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
        [62, '2x2'],
        [73, '2x2'],
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
        ['BY', 'BBAAA'],
        ['BY', 'BBAAA'],
      ],
      ['    Y', '    Y', '    G', ' GYBG', ' BGBRY']
    );
  });

  it('should stop the game if a stack of gems goes above the top row', () => {
    runTest(
      [
        ['RR', 'B'],
        ['RR', 'L'],
        ['RR', 'L'],
        ['RR', 'L'],
        ['RR', 'L'],
        ['RR', 'L'],
        ['RR', 'L'],
        ['BB', ''],
        ['YY', ''],
      ],
      [
        '  R',
        '  R',
        '  R',
        '  R',
        '  R',
        '  R',
        '  R',
        '  R',
        '  R',
        '  R',
        '  RR',
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
        [36, '2x4'],
        [58, '2x2'],
        [60, '4x4'],
        [76, '2x2'],
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
        [42, '3x3'],
        [60, '4x2'],
        [75, '3x2'],
      ]
    );

    runTest(
      [
        ['RY', 'ALLL'],
        ['YY', 'L'],
        ['RG', 'BBR'],
        ['YR', 'BLL'],
        ['RR', 'ALLLL'],
        ['GY', 'B'],
        ['RR', 'RRRRRRR'],
        ['RY', 'ALLL'],
        ['BY', 'BBBBLL'],
        ['BY', 'L'],
        ['BG', 'BBBL'],
        ['BB', 'LLL'],
        ['BY', 'BBLL'],
        ['BR', 'AL'],
        ['RB', 'AR'],
        ['BB', 'RR'],
        ['GG', 'R'],
        ['YB', 'LLLRR'],
        ['GG', ''],
        ['rb', 'RR'],
        ['bY', 'ABLL'],
        ['GY', 'L'],
        ['GR', 'BRR'],
        ['RR', 'LLL'],
        ['yy', 'LLLB'],
        ['RY', 'BB'],
      ],
      ['R  Y', 'R  RR', 'R  GG', 'R  GG', 'R  G', 'RRGGGG'],
      [[63, '2x2']]
    );

    runTest(
      [
        ['GY', 'LL'],
        ['BG', 'R'],
        ['BB', 'BR'],
        ['GG', 'BR'],
        ['RG', 'AAL'],
        ['GB', 'BBRR'],
        ['YG', 'RR'],
        ['YG', 'BRR'],
        ['BG', 'LL'],
        ['GB', ''],
        ['RR', 'R'],
        ['YR', 'AAAA'],
        ['RB', 'RRA'],
        ['YB', 'BB'],
        ['BY', 'LLLB'],
        ['bY', 'R'],
        ['GB', 'L'],
        ['RR', 'L'],
        ['0G', 'AARR'],
        ['RB', 'AAL'],
        ['GB', 'ALL'],
        ['yB', 'R'],
        ['Br', 'LLLA'],
        ['BY', 'L'],
        ['GR', 'ALL'],
        ['B0', 'L'],
        ['rY', 'ALL'],
        ['RB', 'ALLL'],
        ['BR', 'ALL'],
        ['RR', 'LLLLR'],
        ['GY', 'ALLL'],
        ['BB', 'LL'],
        ['0G', 'RRA'],
        ['yr', 'AALL'],
      ],
      [
        ' Y',
        ' RR',
        ' RY',
        ' BB',
        ' BB',
        ' rY y',
        ' GB BG',
        'GGBYYY',
        'RGGYGY',
        'BGGGGG',
        'YY GGG',
      ],
      [
        [37, '2x2'],
        [67, '2x2'],
        [75, '3x2'],
      ]
    );

    runTest(
      [
        ['0R', 'BB'],
        ['YG', 'AAARR'],
        ['BR', 'BBL'],
        ['BG', 'BBLL'],
        ['BR', 'AAALL'],
        ['00', 'BBL'],
        ['yR', 'AARR'],
        ['rY', 'ARRR'],
        ['YB', 'BBL'],
        ['YG', 'AAA'],
        ['BY', 'BBBR'],
        ['YY', 'BRRR'],
        ['RG', 'AAARR'],
        ['bG', 'B'],
        ['Yb', ''],
      ],
      ['     R', '  G GY', '  G YY', ' GYYrY', ' BBYGR']
    );

    runTest(
      [
        ['gR', 'BBRRR'],
        ['BG', 'BBB'],
        ['gg', 'BBLLL'],
        ['YY', 'AAAL'],
        ['YB', 'BLLL'],
        ['RY', 'BBBL'],
        ['RB', 'AA'],
        ['Yr', 'ARR'],
        ['gB', 'AAARRR'],
        ['RB', 'ARR'],
        ['Rr', 'AAALLL'],
        ['YR', 'BB'],
        ['YR', 'R'],
        ['YR', 'BBBRR'],
        ['YB', 'BB'],
        ['YY', 'BBBL'],
        ['GB', 'LLL'],
        ['bb', 'BBBLLL'],
        ['RY', 'AALL'],
        ['BB', 'AARR'],
        ['RY', 'LLL'],
        ['GY', 'AL'],
        ['GY', 'A'],
        ['BG', 'AAARRR'],
        ['RY', 'ALLL'],
        ['RY', 'L'],
        ['BB', 'L'],
        ['GY', 'AAL'],
        ['RY', 'AL'],
        ['YR', 'BRRR'],
        ['RB', 'BBRR'],
        ['BB', 'AR'],
        ['GB', 'BBBR'],
        ['GG', 'BLL'],
        ['GG', ''],
        ['RR', 'LL'],
      ],
      [
        '   Y',
        '  RGGB',
        '  YYBB',
        'G GYRB',
        'RGBBGR',
        'RYBYYY',
        'YYRRYB',
        'bRYYYB',
        'GbGBRB',
        'BRYRRR',
        'rYRYBB',
        'BYYBYg',
      ]
    );

    runTest(
      [
        ['GR', 'LL'],
        ['GR', 'AAL'],
        ['gB', 'R'],
        ['YG', 'AAAL'],
        ['gb', 'BBLLL'],
        ['YY', ''],
        ['BG', 'AAAR'],
        ['GY', 'BBLLL'],
        ['rB', 'BBRRR'],
        ['Br', 'AR'],
        ['GY', 'AR'],
        ['BR', 'BBBRRR'],
        ['rG', 'BBBR'],
        ['Yb', 'LL'],
        ['YY', 'AARRR'],
        ['YY', 'AAARRR'],
        ['GR', 'L'],
        ['BB', 'R'],
        ['YB', 'BBB'],
        ['BG', 'AA'],
        ['00', 'AAARR'],
        ['RG', 'BL'],
        ['YG', 'AR'],
        ['RY', 'ALL'],
        ['BB', 'RRR'],
        ['RR', 'BL'],
        ['BG', 'BBBLL'],
        ['GY', 'BL'],
        ['GB', 'A'],
        ['RY', 'R'],
        ['GB', 'AAR'],
        ['yY', 'BB'],
        ['YB', 'B'],
      ],
      [
        '  B',
        '  G',
        '  G',
        ' YR',
        ' BY B',
        ' RR GB',
        ' RG RB',
        ' GRYBG',
        ' RRGYG',
      ]
    );

    runTest(
      [
        ['GG', 'L'],
        ['YY', 'LLL'],
        ['GG', ''],
        ['YY', 'LL'],
        ['GG', 'AR'],
        ['BB', 'B'],
        ['YY', 'AR'],
        ['BB', 'B'],
        ['BB', 'B'],
        ['BB', 'B'],
        ['BB', 'BLL'],
        ['BB', 'BLL'],
        ['BB', 'BLL'],
        ['BB', 'AR'],
        ['RR', 'AR'],
        ['BB', 'AR'],
        ['GG', 'AR'],
        ['BB', 'AR'],
        ['RR', 'AR'],
        ['BB', 'AR'],
        ['RR', 'B'],
        ['RR', 'B'],
        ['BB', 'B'],
        ['RR', 'BLL'],
        ['BB', 'BLL'],
        ['BB', 'BLL'],
        ['RR', 'BLL'],
        ['Y0', 'LLL'],
        ['R0', 'LLL'],
        ['BB', 'B'],
        ['RY', 'RR'],
        ['BB', 'ALLL'],
        ['BG', 'ALL'],
      ],
      [
        'BBG',
        'RBBB R',
        'BBBB Y',
        'BBBBBB',
        'BBBBBB',
        'BBBBGG',
        'BBBBBB',
        '  GGBB',
        '  GGGG',
      ],
      [
        [42, '4x5'],
        [52, '2x2'],
        [70, '2x2'],
        [74, '2x2'],
      ]
    );

    runTest(
      [
        ['BB', 'L'],
        ['BB', 'BLL'],
        ['BB', 'LR'],
        ['YY', 'LRR'],
        ['YY', 'LRRR'],
        ['YY', 'BLL'],
        ['GG', 'LA'],
        ['GG', 'LA'],
        ['GG', 'LA'],
        ['GG', 'LA'],
        ['GG', 'ALRR'],
        ['GG', 'ALRR'],
        ['GG', 'ALRR'],
        ['GG', 'LBL'],
        ['RR', 'BLL'],
        ['GG', 'LBL'],
        ['BB', 'BLL'],
        ['GG', 'BLL'],
        ['RR', 'BLL'],
        ['GG', 'BLL'],
        ['RR', 'LA'],
        ['RR', 'LA'],
        ['GG', 'LA'],
        ['RR', 'ALRR'],
        ['GG', 'ALRR'],
        ['GG', 'ALRR'],
        ['RR', 'ALRR'],
        ['Y0', 'LRRR'],
        ['R0', 'LRRR'],
        ['RY', 'LLL'],
        ['GG', 'BLRRR'],
        ['GB', 'BLRR'],
        ['GG', 'LA'],
      ],
      [
        '   GGG',
        'R GBGR',
        'Y GGGG',
        'GGGGGG',
        'GGGGGG',
        'BBGGGG',
        'GGGGGG',
        'GGBB',
        'BBBB',
      ],
      [
        [44, '4x5'],
        [48, '2x2'],
        [66, '2x2'],
        [74, '2x2'],
      ]
    );
  });
});
