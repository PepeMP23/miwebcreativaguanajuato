const screens = {
  home: document.getElementById('screen-home'),
  players: document.getElementById('screen-players'),
  game: document.getElementById('screen-game')
};

const startBtn = document.getElementById('startBtn');
const svg = document.getElementById('svgLayer');

let players = [];
let currentPlayerIndex = 0;
const boardSize = 30;

/* 🐍🪜 SERPIENTES Y ESCALERAS */
const snakesAndLadders = {
  3: 11,
  6: 17,
  9: 18,
  14: 22,
  27: 5,
  24: 16,
  20: 8,
  18: 7
};

startBtn.addEventListener('click', () => showScreen('players'));

document.querySelectorAll('[data-players]').forEach(btn => {
  btn.addEventListener('click', () => {
    initPlayers(parseInt(btn.dataset.players));
  });
});


function showScreen(screen) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[screen].classList.add('active');
}

function initPlayers(count) {
  players = Array.from({ length: count }, (_, i) => ({
    name: `Jugador ${i + 1}`,
    position: 0,
    color: `hsl(${i * 70}, 70%, 50%)`
  }));

  createBoard();
  updateUI();
  showScreen('game');
  showTurnModal();
}

function createBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';

  for (let i = boardSize; i >= 1; i--) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.number = i;
    cell.textContent = i;

    /* Marca visual */
    if (snakesAndLadders[i]) {
      cell.style.background =
        snakesAndLadders[i] > i ? '#c8facc' : '#ffd6d6';
    }

    board.appendChild(cell);
  }

  renderTokens();

// Espera a que el DOM pinte el tablero
    requestAnimationFrame(() => {
        drawSnakesAndLadders();
    });

}

function renderTokens() {
  document.querySelectorAll('.token').forEach(t => t.remove());

  players.forEach(player => {
    if (player.position === 0) return;

    const cell = document.querySelector(
      `.cell[data-number="${player.position}"]`
    );

    if (!cell) return;

    const tokensInCell = cell.querySelectorAll('.token').length;

    const token = document.createElement('div');
    token.className = 'token';
    token.style.background = player.color;

    // posiciones tipo cuadrícula (máx 5 jugadores)
    const positions = [
      { bottom: '6px', left: '6px' },
      { bottom: '6px', right: '6px' },
      { top: '6px', left: '6px' },
      { top: '6px', right: '6px' },
      { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    ];

    const pos = positions[tokensInCell] || positions[0];

    Object.assign(token.style, pos);

    cell.appendChild(token);
  });
}

function renderWaitingPlayers() {
  const container = document.getElementById('waitingPlayers');
  container.innerHTML = '';

  players
    .filter(p => p.position === 0)
    .forEach(p => {
      const token = document.createElement('div');
      token.className = 'waiting-token';
      token.style.background = p.color;
      token.title = p.name;
      container.appendChild(token);
    });
}


async function rollDice() {
  const dice = Math.floor(Math.random() * 6) + 1;
  document.getElementById('dice').textContent = dice;
  playSound('dice');

  const player = players[currentPlayerIndex];
  let target = Math.min(player.position + dice, boardSize);

  for (let i = player.position + 1; i <= target; i++) {
    await delay(300);
    player.position = i;
    renderTokens();
  }

  // 🐍🪜 Salto
  if (snakesAndLadders[player.position]) {
    playSound('snake');
    await delay(500);
    player.position = snakesAndLadders[player.position];
    renderTokens();
  }

  if (player.position === boardSize) {
    playSound('win');
    setTimeout(() => {
      alert(`${player.name} ha ganado 🎉`);
      location.reload();
    }, 500);
    return;
  }

  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  updateUI();
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function updateUI() {
  document.getElementById('currentPlayer').textContent =
    players[currentPlayerIndex].name;

  const list = document.getElementById('playersList');
  list.innerHTML = '';

  players.forEach(p => {
    const li = document.createElement('li');
    li.textContent =
      p.position === 0
        ? `${p.name}: en espera`
        : `${p.name}: casilla ${p.position}`;
    list.appendChild(li);
  });

  renderWaitingPlayers();
}

function drawSnakesAndLadders() {
  const svg = document.getElementById('svgLayer');
  if (!svg) return;

  svg.innerHTML = '';

  const board = document.querySelector('.board');
  if (!board) return;

  const b = board.getBoundingClientRect();

  Object.entries(snakesAndLadders).forEach(([start, end]) => {
    const startCell = document.querySelector(`.cell[data-number="${start}"]`);
    const endCell = document.querySelector(`.cell[data-number="${end}"]`);
    if (!startCell || !endCell) return;

    const r1 = startCell.getBoundingClientRect();
    const r2 = endCell.getBoundingClientRect();

    const x1 = r1.left - b.left + r1.width / 2;
    const y1 = r1.top - b.top + r1.height / 2;
    const x2 = r2.left - b.left + r2.width / 2;
    const y2 = r2.top - b.top + r2.height / 2;

    if (end > start) {
      // 🪜 Escalera (doble riel)
      const offset = 6;

      const rail1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      rail1.setAttribute('x1', x1 - offset);
      rail1.setAttribute('y1', y1);
      rail1.setAttribute('x2', x2 - offset);
      rail1.setAttribute('y2', y2);
      rail1.classList.add('ladder');

      const rail2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      rail2.setAttribute('x1', x1 + offset);
      rail2.setAttribute('y1', y1);
      rail2.setAttribute('x2', x2 + offset);
      rail2.setAttribute('y2', y2);
      rail2.classList.add('ladder');

      svg.appendChild(rail1);
      svg.appendChild(rail2);
    } else {
      // 🐍 Serpiente (curva)
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute(
        'd',
        `M ${x1} ${y1}
         C ${x1 + 40} ${y1 + 20},
           ${x2 - 40} ${y2 - 20},
           ${x2} ${y2}`
      );
      path.classList.add('snake');
      svg.appendChild(path);
    }
  });
}

const sounds = {
  dice: new Audio('assets/sounds/dice.mp3'),
  snake: new Audio('assets/sounds/snake.mp3'),
  win: new Audio('assets/sounds/win.mp3')
};

function playSound(type) {
  if (sounds[type]) {
    sounds[type].currentTime = 0;
    sounds[type].play();
  }
}

function showTurnModal() {
  document.getElementById('turnTitle').textContent =
    `Turno de ${players[currentPlayerIndex].name}`;
  document.getElementById('diceAnim').textContent = '🎲';
  document.getElementById('diceAnim').classList.remove('dice-stop');
  document.getElementById('turnModal').classList.remove('hidden');
}

document.getElementById('modalRollBtn').addEventListener('click', async () => {
  document.getElementById('diceAnim').classList.add('dice-stop');

  const dice = Math.floor(Math.random() * 6) + 1;
  document.getElementById('diceAnim').textContent = dice;
  playSound('dice');

  await delay(800);

  document.getElementById('turnModal').classList.add('hidden');
  await movePlayer(dice);
});

async function movePlayer(dice) {
  const player = players[currentPlayerIndex];
  let target = Math.min(player.position + dice, boardSize);

  for (let i = player.position + 1; i <= target; i++) {
    await delay(300);
    player.position = i;
    renderTokens();
  }

  if (snakesAndLadders[player.position]) {
    playSound('snake');
    await delay(500);
    player.position = snakesAndLadders[player.position];
    renderTokens();
  }

  if (player.position === boardSize) {
    showWinner(player.name);
    playSound('win');
    return;
    }

    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;

    // ⏱️ Espera después de terminar animaciones
    await delay(3000);

    // 👇 Modal del siguiente jugador
    showTurnModal();
    updateUI();

}

function showWinner(name) {
  document.getElementById('winTitle').textContent =
    `🏆 ${name} ha ganado`;
  document.getElementById('winModal').classList.remove('hidden');
}


function showWinner(name) {
  document.getElementById('winTitle').textContent =
    `🏆 ${name} ha ganado`;
  document.getElementById('winModal').classList.remove('hidden');
}

/* =========================
   REDIBUJAR SVG AL RESIZE
========================= */
window.addEventListener('resize', () => {
  drawSnakesAndLadders();
});
