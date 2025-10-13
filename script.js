// =============================================================
//  🧱 Casse-Briques Phaser - Version stable et centrée
// =============================================================
// ✅ Canvas Phaser de 1000x700 pixels
// ✅ Physique arcade activée
// ✅ Rebond parfait, pas de sortie de balle visible
// ✅ Gestion des niveaux, vies, diamants
// ✅ Musique, boutons Pause / Recommencer
// ✅ Mur invisible gauche + droite pour ne pas sortir du cadre
// =============================================================

// Variables globales
let cursors;
let bricks;
let ball;
let paddle;
let level = 1;
let lives = 3;
let levelText;
let livesText;
let diamondCount = 0;
let diamondText;
let ballLaunched = false;
let isPaused = false;

// Liens vers le HUD HTML
const levelDisplay = document.getElementById("level-display");
const livesDisplay = document.getElementById("lives-display");
const diamondsDisplay = document.getElementById("diamonds-display");
const pauseButton = document.getElementById("pause-btn");
const restartButton = document.getElementById("restart-btn");

// =============================================================
// CONFIGURATION PHASER
// =============================================================
const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 700,
    backgroundColor: "#5C2E1F",
    parent: "game-container",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

// =============================================================
//  🔄 PRELOAD : chargement des images et sons
// =============================================================
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

// =============================================================
//  🧱 CREATE : création des éléments du jeu
// =============================================================
function create() {
    // --- Raquette ---
    paddle = this.physics.add.sprite(config.width / 2, 650, "paddle");
    paddle.setImmovable(true);
    paddle.setScale(0.4);
    paddle.setCollideWorldBounds(true);

    // --- Balle ---
    ball = this.physics.add.sprite(config.width / 2, 500, "ball");
    ball.setBounce(1);
    ball.setScale(0.6);
    ball.setVelocity(0, 0);
    ball.setCollideWorldBounds(true);
    ball.body.onWorldBounds = true;

    // --- Murs invisibles gauche / droite ---
    let rightWall = this.add.rectangle(960, 350, 10, 700, 0xffffff, 0); // Mur invisible à droite
    let leftWall = this.add.rectangle(40, 350, 10, 700, 0xffffff, 0);   // Mur invisible à gauche

    this.physics.add.existing(rightWall, true);
    this.physics.add.existing(leftWall, true);
    this.physics.add.collider(ball, rightWall);
    this.physics.add.collider(ball, leftWall);

    // --- Détection de sortie par le bas ---
    this.physics.world.on("worldbounds", (body, up, down) => {
        if (body.gameObject === ball && down) {
            perdreVie(this);
        }
    });

    // --- Touches clavier ---
    cursors = this.input.keyboard.createCursorKeys();

    // --- Briques ---
    createBricks.call(this);

    // --- Collisions ---
    this.physics.add.collider(ball, paddle, ballHitPaddle, null, this);
    this.physics.add.collider(ball, bricks, ballHitBrick, null, this);

    // --- Textes HUD internes à Phaser ---
    levelText = this.add.text(850, 20, "LEVEL : " + level, { fontSize: "24px", fill: "#ffffff" });
    livesText = this.add.text(850, 50, "❤️❤️❤️", { fontSize: "24px", fill: "#ff0000" });
    diamondText = this.add.text(850, 80, "💎: 0", { fontSize: "24px", fill: "#00ffff" });

    // --- Lancer la balle au clic ---
    this.input.on("pointerdown", () => {
        if (!ballLaunched) {
            ball.setVelocity(200, -200);
            ballLaunched = true;
        }
    });

    // --- Musique ---
    let music = this.sound.add("backgroundMusic", { loop: true, volume: 0.5 });
    music.play();

    let musicPlaying = true;
    const musicButton = document.getElementById("music-toggle");
    if (musicButton) {
        musicButton.addEventListener("click", () => {
            if (musicPlaying) {
                music.pause();
                musicButton.textContent = "🎵 Play";
            } else {
                music.resume();
                musicButton.textContent = "🎵 Pause";
            }
            musicPlaying = !musicPlaying;
        });
    }
}

// =============================================================
//  🧱 CRÉATION DES BRIQUES
// =============================================================
function createBricks() {
    const brickColors = ["maron", "vert", "noir", "roseViolet", "violet"];
    bricks = this.physics.add.staticGroup();

    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 8; x++) {
            let colorIndex = (x + y) % brickColors.length;
            bricks.create(100 + x * 100, 60 + y * 45, brickColors[colorIndex]).setScale(1).refreshBody();
        }
    }
}

// =============================================================
//  💥 COLLISIONS
// =============================================================
function ballHitBrick(ball, brick) {
    brick.destroy();
    updateDiamonds(1);
}

function ballHitPaddle(ball, paddle) {
    let diff = ball.x - paddle.x;
    ball.setVelocityX(diff * 5);
}

// =============================================================
//  🔁 RESET ET LOGIQUE DE JEU
// =============================================================
function resetBall(scene) {
    ball.setVelocity(0, 0);
    ball.setPosition(paddle.x, paddle.y - 30);
    ball.setActive(true).setVisible(true);

    scene.input.once("pointerdown", () => {
        ball.setVelocity(200, -200);
        ballLaunched = true;
    });
}

// =============================================================
//  🔄 UPDATE : logique frame par frame
// =============================================================
function update() {
    // Déplacement raquette avec limites
    let rightLimit = 960;
    let leftLimit = 40;

    if (cursors.left.isDown && paddle.x > leftLimit) {
        paddle.setVelocityX(-400);
    } else if (cursors.right.isDown && paddle.x < rightLimit) {
        paddle.setVelocityX(400);
    } else {
        paddle.setVelocityX(0);
    }

    // Vérifie si toutes les briques sont détruites
    if (bricks.countActive() === 0) {
        level++;
        updateLife();
        updateDiamonds(1);

        bricks.clear(true, true);
        createBricks.call(this);
        this.physics.add.collider(ball, bricks, ballHitBrick, null, this);

        resetBall(this);

        // Augmente la vitesse de la balle à chaque niveau
        let speedMultiplier = 1.1;
        let newVelocityX = ball.body.velocity.x * speedMultiplier;
        let newVelocityY = ball.body.velocity.y * speedMultiplier;
        let maxSpeed = 600;

        ball.setVelocity(
            Phaser.Math.Clamp(newVelocityX, -maxSpeed, maxSpeed),
            Phaser.Math.Clamp(newVelocityY, -maxSpeed, maxSpeed)
        );
    }
}

// =============================================================
//  🧠 LOGIQUE DE VIES, NIVEAUX, DIAMANTS
// =============================================================
function perdreVie(scene) {
    lives--;
    updateLife();

    if (lives <= 0) {
        scene.add.text(config.width / 2, config.height / 2, "GAME OVER", {
            fontSize: "48px",
            fill: "#ff0000"
        }).setOrigin(0.5);

        scene.physics.pause();
    } else {
        ballLaunched = false;
        resetBall(scene);
    }
}

function updateLife() {
    levelText.setText("LEVEL : " + level);
    let hearts = "❤️".repeat(lives);
    livesText.setText(hearts);
}

function updateDiamonds(amount) {
    diamondCount += amount;
    diamondsDisplay.textContent = "💎: " + diamondCount;
    diamondText.setText("💎: " + diamondCount);
}

// =============================================================
//  ⏸️ BOUTONS HTML
// =============================================================
pauseButton.addEventListener("click", () => {
    if (!isPaused) {
        game.scene.scenes[0].scene.pause();
        pauseButton.textContent = "▶ Reprendre";
    } else {
        game.scene.scenes[0].scene.resume();
        pauseButton.textContent = "⏸ Pause";
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
    pauseButton.textContent = "⏸ Pause";
    isPaused = false;
});

// =============================================================
//  🍔 MENU BURGER
// =============================================================
const burger = document.createElement("div");
burger.className = "burger-menu";
burger.innerHTML = "☰";
document.querySelector(".navbar").prepend(burger);

const navLinks = document.querySelector(".nav-center");
burger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
});
