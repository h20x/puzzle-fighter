import { Game } from './game';

export function puzzleFighter(instructions) {
  const game = new Game();
  instructions.forEach((inst) => game.exec(inst));

  return game.getStateStr();
}
