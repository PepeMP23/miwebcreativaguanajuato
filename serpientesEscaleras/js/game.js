const screens = {
  home: document.getElementById('screen-home'),
  players: document.getElementById('screen-players'),
  game: document.getElementById('screen-game')
};

const startBtn = document.getElementById('startBtn');
const svgLayer = document.getElementById('svgLayer');

let players = [];
let currentPlayerIndex = 0;
const boardSize = 30;

/* 🐍🪜 SERPIENTES Y ESCALERAS */
const snakesAndLadders = {
  3: 10,
  6: 17,
  14: 27,
  15: 2,
  24: 16,
  26: 13,
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

    if (snakesAndLadders[i]) {
      cell.style.background =
        snakesAndLadders[i] > i ? '#c8facc' : '#ffd6d6';
    }

    board.appendChild(cell);
  }

  renderTokens();

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
    const totalTokens = players.filter(p => p.position === player.position).length;

    const token = document.createElement('div');
    token.className = 'token';
    token.style.background = player.color;

    // 📐 Distribución circular
    const radius = totalTokens > 1 ? 12 : 0;
    const angle = (2 * Math.PI / totalTokens) * tokensInCell;

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    token.style.left = `50%`;
    token.style.top = `50%`;
    token.style.transform = `
      translate(-50%, -50%)
      translate(${x}px, ${y}px)
    `;

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
      container.appendChild(token);
    });
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

/* =========================
   DIBUJO SVG (CLAVE)
========================= */
function drawSnakesAndLadders() {
  if (!svgLayer) return;

  svgLayer.innerHTML = '';

  const board = document.querySelector('.board');
  if (!board) return;

  const rect = board.getBoundingClientRect();

  // 🔥 CLAVE: viewBox correcto
  svgLayer.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
  svgLayer.setAttribute('width', rect.width);
  svgLayer.setAttribute('height', rect.height);

  Object.entries(snakesAndLadders).forEach(([start, end]) => {
    const startCell = document.querySelector(`.cell[data-number="${start}"]`);
    const endCell = document.querySelector(`.cell[data-number="${end}"]`);
    if (!startCell || !endCell) return;

    const r1 = startCell.getBoundingClientRect();
    const r2 = endCell.getBoundingClientRect();

    const x1 = r1.left - rect.left + r1.width / 2;
    const y1 = r1.top - rect.top + r1.height / 2;
    const x2 = r2.left - rect.left + r2.width / 2;
    const y2 = r2.top - rect.top + r2.height / 2;

    if (end > start) {
      const offset = 4;

      ['-','+'].forEach(sign => {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1 + (sign === '+' ? offset : -offset));
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2 + (sign === '+' ? offset : -offset));
        line.setAttribute('y2', y2);
        line.classList.add('ladder');
        svgLayer.appendChild(line);
      });
    } else {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute(
        'd',
        `M ${x1} ${y1}
         C ${x1 + 30} ${y1 + 20},
           ${x2 - 30} ${y2 - 20},
           ${x2} ${y2}`
      );
      path.classList.add('snake');
      svgLayer.appendChild(path);
    }
  });
}

/* =========================
   MODALES
========================= */
function showTurnModal() {
  document.getElementById('turnTitle').textContent =
    `Turno de ${players[currentPlayerIndex].name}`;
  document.getElementById('diceAnim').textContent = '🎲';
  document.getElementById('turnModal').classList.remove('hidden');
}

document.getElementById('modalRollBtn').addEventListener('click', async () => {
  const dice = Math.floor(Math.random() * 6) + 1;
  document.getElementById('diceAnim').textContent = dice;

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
    await delay(500);
    player.position = snakesAndLadders[player.position];
    renderTokens();
  }

  if (player.position === boardSize) {
    showWinner(player.name);
    return;
  }

  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  updateUI();

  await delay(3000);
  showTurnModal();
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function showWinner(name) {
  document.getElementById('winTitle').textContent = `🏆 ${name} ha ganado`;
  document.getElementById('winModal').classList.remove('hidden');
}

/* 🔁 REDIBUJAR AL RESIZE */
window.addEventListener('resize', drawSnakesAndLadders);
