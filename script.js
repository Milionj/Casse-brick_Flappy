// =============================================================
// Casse-Briques Phaser + Menu Burger Mobile
// =============================================================

let cursors, bricks, ball, paddle;
let level = 1, lives = 3, diamondCount = 0;
let ballLaunched = false, isPaused = false;
let levelText, livesText, diamondText;
const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

const levelDisplay = document.getElementById("level-display");
const livesDisplay = document.getElementById("lives-display");
const diamondsDisplay = document.getElementById("diamonds-display");
const pauseButton = document.getElementById("pause-btn");
const restartButton = document.getElementById("restart-btn");

const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 700,
  backgroundColor: "#5C2E1F",
  parent: "game-container",
  physics: { default: "arcade", arcade: { gravity: { y: 0 }, debug: false } },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);

// ===== PRELOAD =====
function preload() {
  this.load.image("paddle", "img/raquetteFigama.png");
  this.load.image("ball", "img/balleFigma.png");
  this.load.image("maron", "img/rectangleMaron.png");
  this.load.image("vert", "img/rectangleVert.png");
  this.load.image("noir", "img/rectangleNoir.png");
  this.load.image("roseViolet", "img/rectangleRoseViolet.png");
  this.load.image("violet", "img/rectangleViolet.png");
  this.load.image("diamonds", "img/teteDiams.png");
  this.load.audio("backgroundMusic", "img/Graceful.mp3");
}

// ===== CREATE =====
function create() {
  paddle = this.physics.add.sprite(config.width / 2, 650, "paddle");
  paddle.setImmovable(true).setScale(0.4).setCollideWorldBounds(true);

  ball = this.physics.add.sprite(config.width / 2, 500, "ball");
  ball.setBounce(1).setScale(0.6).setVelocity(0, 0).setCollideWorldBounds(true);
  ball.body.onWorldBounds = true;

  const leftWall = this.add.rectangle(40, 350, 10, 700, 0xffffff, 0);
  const rightWall = this.add.rectangle(960, 350, 10, 700, 0xffffff, 0);
  this.physics.add.existing(leftWall, true);
  this.physics.add.existing(rightWall, true);
  this.physics.add.collider(ball, leftWall);
  this.physics.add.collider(ball, rightWall);

  this.physics.world.on("worldbounds", (body, up, down) => {
    if (body.gameObject === ball && down) perdreVie(this);
  });

  cursors = this.input.keyboard.createCursorKeys();
  createBricks.call(this);
  this.physics.add.collider(ball, paddle, ballHitPaddle, null, this);
  this.physics.add.collider(ball, bricks, ballHitBrick, null, this);

  levelText = this.add.text(850, 20, "LEVEL : " + level, { fontSize: "24px", fill: "#fff" });
  livesText = this.add.text(850, 50, "♥♥♥", { fontSize: "24px", fill: "#f00" });
  diamondText = this.add.text(850, 80, "DIAMONDS: 0", { fontSize: "24px", fill: "#0ff" });

  this.input.on("pointerdown", (pointer) => {
    movePaddleToPointer(pointer);
    if (!ballLaunched) {
      ball.setVelocity(200, -200);
      ballLaunched = true;
    }
  });

  this.input.on("pointermove", (pointer) => {
    if (pointer.isDown || pointer.pointerType === "touch" || isTouchDevice) {
      movePaddleToPointer(pointer);
    }
  });

  const music = this.sound.add("backgroundMusic", { loop: true, volume: 0.5 });
  music.play();
  let musicPlaying = true;
  const musicButton = document.getElementById("music-toggle");
  if (musicButton) {
    musicButton.addEventListener("click", () => {
      if (musicPlaying) {
        music.pause();
        musicButton.textContent = "▶ Play";
      } else {
        music.resume();
        musicButton.textContent = "❚❚ Pause";
      }
      musicPlaying = !musicPlaying;
    });
  }
}

// ===== BRIQUES =====
function createBricks() {
  const colors = ["maron", "vert", "noir", "roseViolet", "violet"];
  bricks = this.physics.add.staticGroup();
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 8; x++) {
      const c = colors[(x + y) % colors.length];
      bricks.create(100 + x * 100, 60 + y * 45, c).refreshBody();
    }
  }
}

// ===== COLLISIONS =====
function ballHitBrick(ball, brick) {
  brick.destroy();
  updateDiamonds(1);
}
function ballHitPaddle(ball, paddle) {
  const diff = ball.x - paddle.x;
  ball.setVelocityX(diff * 5);
}

// ===== LOGIQUE =====
function resetBall(scene) {
  ball.setVelocity(0, 0);
  ball.setPosition(paddle.x, paddle.y - 30);
  scene.input.once("pointerdown", () => {
    ball.setVelocity(200, -200);
    ballLaunched = true;
  });
}
function update() {
  if (cursors.left.isDown && paddle.x > 40) paddle.setVelocityX(-400);
  else if (cursors.right.isDown && paddle.x < 960) paddle.setVelocityX(400);
  else paddle.setVelocityX(0);

  // Keep the ball stuck to the paddle until launch (touch friendly).
  if (!ballLaunched) {
    ball.setPosition(paddle.x, paddle.y - 30);
  }

  // Touch players steer through pointermove; kill keyboard momentum.
  if (isTouchDevice) {
    paddle.setVelocityX(0);
  }

  if (bricks.countActive() === 0) {
    level++;
    updateLife();
    updateDiamonds(1);
    bricks.clear(true, true);
    createBricks.call(this);
    this.physics.add.collider(ball, bricks, ballHitBrick, null, this);
    resetBall(this);
  }
}
function perdreVie(scene) {
  lives--;
  updateLife();
  if (lives <= 0) {
    scene.add.text(config.width / 2, config.height / 2, "GAME OVER", { fontSize: "48px", fill: "#ff0000" }).setOrigin(0.5);
    scene.physics.pause();
  } else {
    ballLaunched = false;
    resetBall(scene);
  }
}
function updateLife() {
  levelText.setText("LEVEL : " + level);
  livesText.setText("♥".repeat(lives));
}
function updateDiamonds(amount) {
  diamondCount += amount;
  diamondsDisplay.textContent = "DIAMONDS: " + diamondCount;
  diamondText.setText("DIAMONDS: " + diamondCount);
}

function movePaddleToPointer(pointer) {
  const targetX = Phaser.Math.Clamp(pointer.x, 60, 940);
  paddle.setVelocityX(0);
  paddle.setX(targetX);
  if (!ballLaunched) {
    ball.setX(targetX);
  }
}

// ===== BOUTONS =====
pauseButton.addEventListener("click", () => {
  if (gameOverScreenVisible()) return;
  if (!isPaused) {
    game.scene.scenes[0].scene.pause();
    pauseButton.textContent = "▶ Reprendre";
  } else {
    game.scene.scenes[0].scene.resume();
    pauseButton.textContent = "❚❚ Pause";
  }
  isPaused = !isPaused;
});

restartButton.addEventListener("click", () => {
  game.scene.scenes[0].scene.restart();
  level = 1;
  lives = 3;
  diamondCount = 0;
  ballLaunched = false;
  updateLife();
  updateDiamonds(0);
  pauseButton.textContent = "❚❚ Pause";
  isPaused = false;
});

function gameOverScreenVisible() {
  return lives <= 0;
}

// ===== MENU BURGER =====
const burger = document.createElement("div");
burger.className = "burger-menu";
burger.textContent = "☰";
const navLinks = document.getElementById("main-nav");
const navRight = document.querySelector(".nav-right") || document.querySelector(".navbar");
navRight.appendChild(burger);
burger.addEventListener("click", () => {
  if (!navLinks) return;
  navLinks.classList.toggle("active");
  const expanded = navLinks.classList.contains("active");
  burger.setAttribute("aria-expanded", expanded ? "true" : "false");
});
if (navLinks) {
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      burger.setAttribute("aria-expanded", "false");
    });
  });
}
