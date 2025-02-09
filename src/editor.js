import { Game } from './game.js';
import { Field } from './field.js';

const cols = 6;
const rows = 12;

const commands = restoreCommands();
let cp = 0;

let history = [];
let hp = 0;

const btnPrevState = document.getElementById('prev-state');
const btnNextState = document.getElementById('next-state');
const btnNextCmd = document.getElementById('next-cmd');
const btnLastCmd = document.getElementById('last-cmd');
const btnReset = document.getElementById('reset');
const commandList = document.getElementById('commands');

btnPrevState.addEventListener('click', prevState);
btnNextState.addEventListener('click', nextState);
btnNextCmd.addEventListener('click', nextCmd);
btnLastCmd.addEventListener('click', lastCmd);
btnReset.addEventListener('click', reset);

document.addEventListener('keydown', (e) => {
  if (e.target === commandList) {
    return;
  }

  switch (e.code) {
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'KeyQ':
      return prevState();

    case 'ArrowRight':
    case 'ArrowDown':
    case 'KeyW':
      return nextState();

    case 'KeyE':
      return nextCmd();

    case 'KeyR':
      return reset();

    case 'KeyT':
      return lastCmd();
  }
});

let game = new Game(cols, rows);
const field = new Field(cols, rows, document.getElementById('field'));

field.render();
nextCmd();

function reset() {
  cp = hp = 0;
  history = [];
  game = new Game(cols, rows);
  parseCommands();
  saveCommands();
  nextCmd();
}

function lastCmd() {
  while (cp < commands.length) {
    history = game.exec(commands[cp++]);
  }

  hp = history.length - 1;

  if (history.length) {
    field.render(history[hp]);
  }

  updateCommandList();
  updateControls();
}

function nextCmd() {
  if (cp >= commands.length) {
    return;
  }

  hp = 0;
  history = game.exec(commands[cp++]);

  if (history.length) {
    field.render(history[hp]);
  }

  updateCommandList();
  updateControls();
}

function updateControls() {
  btnPrevState.disabled = hp <= 0;
  btnNextState.disabled = hp >= history.length - 1;
  btnNextCmd.disabled = cp >= commands.length;
}

function updateCommandList() {
  commandList.value = commands.reduce((acc, [types, moves], i) => {
    return acc + (i === cp - 1 ? '> ' : '  ') + `['${types}'], ['${moves}']\n`;
  }, '');
}

function parseCommands() {
  commands.length = 0;
  commandList.value
    .trim()
    .split('\n')
    .filter(Boolean)
    .forEach((str) => {
      str = str.replace(/[\s\[\]>'"]/g, '');
      const c = str.split(',', 2);

      if (c.length < 2) {
        return;
      }

      let [gems, moves] = c;

      gems = gems
        .replace(/[^RGB]/gi, 'R')
        .slice(0, 2)
        .padEnd(2, 'R');

      moves = moves.replace(/[^LRAB]/g, '').toUpperCase();

      if (!moves.length) {
        return;
      }

      commands.push([gems, moves]);
    });
}

function saveCommands() {
  localStorage.setItem('commands', JSON.stringify(commands));
}

function restoreCommands() {
  const commands = localStorage.getItem('commands');

  return commands ? JSON.parse(commands) : [];
}

function nextState() {
  if (hp >= history.length - 1) {
    return;
  }

  hp = Math.min(++hp, history.length - 1);
  field.render(history[hp]);
  updateControls();
}

function prevState() {
  if (hp <= 0) {
    return;
  }

  hp = Math.max(--hp, 0);
  field.render(history[hp]);
  updateControls();
}
