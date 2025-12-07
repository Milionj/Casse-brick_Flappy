const gameContainer = document.getElementById("gameContainer");
const birdElem = document.getElementById("bird");
const scoreDisplay = document.getElementById("scoreDisplay");
const startScreen = document.getElementById("start-screen");
const lengthDisplay = document.getElementById("lengthDisplay");

// Image de l'oiseau
birdElem.style.backgroundImage = "url('img/bird1.png')";
birdElem.style.backgroundSize = "contain";
birdElem.style.backgroundRepeat = "no-repeat";

let gameRunning = false;
let isPaused = false;
let gameOver = true; // écran d'accueil par défaut
let score = 0;
let distance = 0;
let gravity = 0.4;
let jumpStrength = -8;
let pipeSpeed = 2.5;
let spawnInterval = 90;
let birdY = 250;
let birdVelocity = 0;
let pipes = [];
let spawnCounter = 0;

startScreen.textContent = "Appuie sur ESPACE ou touche l'écran pour commencer";

// Contrôles clavier + tactile
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    handleInput(e);
  }
});
gameContainer.addEventListener("pointerdown", handleInput);
startScreen.addEventListener("pointerdown", handleInput);

// Démarrer le jeu
function startGame() {
  isPaused = false;
  gameOver = false;
  gameRunning = true;
  score = 0;
  distance = 0;
  birdY = 250;
  birdVelocity = 0;
  spawnCounter = 0;
  pipes = [];

  document.querySelectorAll(".pipe").forEach((pipe) => pipe.remove());

  startScreen.style.display = "none";
  requestAnimationFrame(updateGame);
}

// Boucle de jeu principale
function updateGame() {
  if (!gameRunning) return;

  birdVelocity += gravity;
  birdY += birdVelocity;
  birdElem.style.top = `${birdY}px`;

  spawnCounter++;
  if (spawnCounter >= spawnInterval) {
    spawnPipe();
    spawnCounter = 0;
  }

  for (let i = 0; i < pipes.length; i++) {
    pipes[i].x -= pipeSpeed;
    pipes[i].topElem.style.left = `${pipes[i].x}px`;
    pipes[i].bottomElem.style.left = `${pipes[i].x}px`;

    if (pipes[i].x + pipes[i].width < 0) {
      pipes[i].topElem.remove();
      pipes[i].bottomElem.remove();
      pipes.splice(i, 1);
      i--;
      continue;
    }

    if (collision(birdElem, pipes[i].topElem) || collision(birdElem, pipes[i].bottomElem)) {
      endGame();
    }

    if (!pipes[i].passed && pipes[i].x + pipes[i].width < 50) {
      pipes[i].passed = true;
      score++;
      scoreDisplay.textContent = `SCORE: ${score}`;
    }
  }

  if (birdY + 40 >= gameContainer.clientHeight) {
    endGame();
  }

  distance += 0.1;
  lengthDisplay.textContent = `LENGTH: ${Math.floor(distance)}m`;

  requestAnimationFrame(updateGame);
}

function endGame() {
  gameRunning = false;
  gameOver = true;
  isPaused = false;
  startScreen.style.display = "block";
}

function spawnPipe() {
  const pipeWidth = 80;
  const gapHeight = 200;
  const minPipeHeight = 100;
  const maxPipeHeight = gameContainer.clientHeight - gapHeight - minPipeHeight;

  const topHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
  const bottomHeight = gameContainer.clientHeight - gapHeight - topHeight;
  const pipeX = gameContainer.clientWidth;

  const topPipe = document.createElement("div");
  topPipe.classList.add("pipe", "top");
  topPipe.style.height = `${topHeight}px`;
  topPipe.style.width = `${pipeWidth}px`;
  topPipe.style.left = `${pipeX}px`;

  const bottomPipe = document.createElement("div");
  bottomPipe.classList.add("pipe", "bottom");
  bottomPipe.style.height = `${bottomHeight}px`;
  bottomPipe.style.width = `${pipeWidth}px`;
  bottomPipe.style.left = `${pipeX}px`;

  gameContainer.appendChild(topPipe);
  gameContainer.appendChild(bottomPipe);

  pipes.push({
    x: pipeX,
    width: pipeWidth,
    topHeight: topHeight,
    bottomHeight: bottomHeight,
    topElem: topPipe,
    bottomElem: bottomPipe,
    passed: false,
  });
}

function collision(bird, pipe) {
  const birdRect = bird.getBoundingClientRect();
  const pipeRect = pipe.getBoundingClientRect();

  return !(
    birdRect.top > pipeRect.bottom ||
    birdRect.bottom < pipeRect.top ||
    birdRect.left > pipeRect.right ||
    birdRect.right < pipeRect.left
  );
}

// Gestion des boutons
document.getElementById("pause-btn").addEventListener("click", () => {
  if (gameOver) return;
  isPaused = !isPaused;
  gameRunning = !isPaused;
  if (gameRunning) requestAnimationFrame(updateGame);
});

document.getElementById("restart-btn").addEventListener("click", () => {
  gameOver = true;
  isPaused = false;
  startGame();
});

const settingsBtn = document.getElementById("settings-btn");
if (settingsBtn) {
  settingsBtn.addEventListener("click", () => {
    alert("Parametres non implementes !");
  });
}

// Menu Burger
const burger = document.querySelector(".burger-menu") || (() => {
  const b = document.createElement("div");
  b.className = "burger-menu";
  b.textContent = "|||";
  (document.querySelector(".nav-right") || document.querySelector(".navbar"))?.appendChild(b);
  return b;
})();
const navLinks = document.querySelector(".nav-center");
function toggleNav(e) {
  if (e) e.preventDefault();
  if (!navLinks) return;
  navLinks.classList.toggle("active");
  const expanded = navLinks.classList.contains("active");
  burger.setAttribute("aria-expanded", expanded ? "true" : "false");
}
if (burger) {
  burger.addEventListener("click", toggleNav);
}
if (navLinks) {
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("active");
      burger.setAttribute("aria-expanded", "false");
    })
  );
}

function handleInput(event) {
  if (event) event.preventDefault();

  if (gameOver) {
    startGame();
  } else if (!gameRunning && isPaused) {
    isPaused = false;
    gameRunning = true;
    requestAnimationFrame(updateGame);
  } else if (!gameRunning) {
    startGame();
  }

  birdVelocity = jumpStrength;
}