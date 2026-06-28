const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const diffBtns = document.querySelectorAll('.diff-btn');

const CELL = 20;
const COLS = canvas.width / CELL;
const ROWS = canvas.height / CELL;

const COLORS = [
  '#00dd00', '#22cc00', '#44bb00',
  '#66aa00', '#889900', '#aa7700',
  '#cc5500', '#ee3300',
];

let snake, direction, nextDirection, food, score, gameLoop, paused, running, speed;

speed = 200;

function loadBest() {
  return parseInt(localStorage.getItem('snakeBest') || '0', 10);
}

function saveBest(val) {
  localStorage.setItem('snakeBest', val);
}

function init() {
  snake = [
    { x: 10, y: 10 },
    { x: 9,  y: 10 },
    { x: 8,  y: 10 },
  ];
  direction     = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score   = 0;
  paused  = false;
  running = false;
  scoreEl.textContent = 0;
  bestEl.textContent  = loadBest();
  spawnFood();
  drawFrame();
}

function spawnFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  food = pos;
}

function update() {
  direction = { ...nextDirection };

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
    return endGame();
  }

  if (snake.some(s => s.x === head.x && s.y === head.y)) {
    return endGame();
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = score;
    const best = loadBest();
    if (score > best) {
      saveBest(score);
      bestEl.textContent = score;
    }
    spawnFood();
  } else {
    snake.pop();
  }

  drawFrame();
}

function getSnakeColor(index) {
  const colorIndex = Math.min(
    Math.floor(index * COLORS.length / Math.max(snake.length, COLORS.length)),
    COLORS.length - 1
  );
  return COLORS[colorIndex];
}

function drawFrame() {
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#9aaa7a' : '#8a9a6a';
      ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
    }
  }

  ctx.fillStyle = '#cc3333';
  ctx.fillRect(food.x * CELL + 3, food.y * CELL + 3, CELL - 6, CELL - 6);
  ctx.fillStyle = '#ff5555';
  ctx.fillRect(food.x * CELL + 4, food.y * CELL + 4, 4, 4);

  snake.forEach((seg, i) => {
    ctx.fillStyle = getSnakeColor(i);
    ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);

    if (i === 0) {
      ctx.fillStyle = '#1a1a0a';
      if (direction.x === 1) {
        ctx.fillRect(seg.x * CELL + 13, seg.y * CELL + 4,  3, 3);
        ctx.fillRect(seg.x * CELL + 13, seg.y * CELL + 13, 3, 3);
      } else if (direction.x === -1) {
        ctx.fillRect(seg.x * CELL + 4, seg.y * CELL + 4,  3, 3);
        ctx.fillRect(seg.x * CELL + 4, seg.y * CELL + 13, 3, 3);
      } else if (direction.y === -1) {
        ctx.fillRect(seg.x * CELL + 4,  seg.y * CELL + 4, 3, 3);
        ctx.fillRect(seg.x * CELL + 13, seg.y * CELL + 4, 3, 3);
      } else {
        ctx.fillRect(seg.x * CELL + 4,  seg.y * CELL + 13, 3, 3);
        ctx.fillRect(seg.x * CELL + 13, seg.y * CELL + 13, 3, 3);
      }
    }
  });

  if (!running) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#e8dcc8';
    ctx.textAlign = 'center';

    if (paused) {
      ctx.font = '12px "Press Start 2P"';
      ctx.fillText('ПАУЗА', canvas.width / 2, canvas.height / 2);
    } else if (score > 0) {
      ctx.font = '12px "Press Start 2P"';
      ctx.fillText('ИГРА ОКОНЧЕНА', canvas.width / 2, canvas.height / 2 - 20);
      ctx.font = '8px "Press Start 2P"';
      ctx.fillStyle = '#c8b89a';
      ctx.fillText('СЧЁТ: ' + score, canvas.width / 2, canvas.height / 2 + 10);
    } else {
      ctx.font = '12px "Press Start 2P"';
      ctx.fillText('НАЖМИТЕ СТАРТ', canvas.width / 2, canvas.height / 2);
    }
  }
}

function startGame() {
  running = true;
  paused  = false;
  startBtn.disabled   = true;
  pauseBtn.disabled   = false;
  restartBtn.disabled = false;
  diffBtns.forEach(b => b.disabled = true);
  gameLoop = setInterval(update, speed);
}

function pauseGame() {
  if (!paused) {
    paused  = true;
    running = false;
    clearInterval(gameLoop);
    pauseBtn.textContent = 'ПРОДОЛЖИТЬ';
    drawFrame();
  } else {
    paused  = false;
    running = true;
    pauseBtn.textContent = 'ПАУЗА';
    gameLoop = setInterval(update, speed);
  }
}

function endGame() {
  running = false;
  clearInterval(gameLoop);
  startBtn.disabled    = false;
  pauseBtn.disabled    = true;
  pauseBtn.textContent = 'ПАУЗА';
  diffBtns.forEach(b => b.disabled = false);
  drawFrame();
}

function restartGame() {
  clearInterval(gameLoop);
  pauseBtn.textContent = 'ПАУЗА';
  diffBtns.forEach(b => b.disabled = false);
  init();
  startGame();
}

diffBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    diffBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    speed = parseInt(btn.dataset.speed, 10);
  });
});

document.addEventListener('keydown', e => {
  const keys = {
    ArrowUp:    { x: 0,  y: -1 },
    ArrowDown:  { x: 0,  y:  1 },
    ArrowLeft:  { x: -1, y:  0 },
    ArrowRight: { x: 1,  y:  0 },
    W: { x: 0,  y: -1 },
    S: { x: 0,  y:  1 },
    A: { x: -1, y:  0 },
    D: { x: 1,  y:  0 },
    w: { x: 0,  y: -1 },
    s: { x: 0,  y:  1 },
    a: { x: -1, y:  0 },
    d: { x: 1,  y:  0 },
  };

  const newDir = keys[e.key];
  if (!newDir) return;

  if (newDir.x === -direction.x && newDir.y === -direction.y) return;

  e.preventDefault();

  nextDirection = newDir;
});

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', restartGame);

init();
