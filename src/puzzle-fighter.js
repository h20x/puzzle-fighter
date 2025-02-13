import { Game } from './game';

export function puzzleFighter(instructions) {
  const game = new Game(6, 12);
  instructions.forEach((inst) => game.exec(inst));

  return game.getStateStr();
}
