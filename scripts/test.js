const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Pridobi referenco do križca
const closeBtn = document.getElementById('close-overlay');
const overlayElement = document.getElementById('game-over-overlay');

// Zvoki
const START_SOUND = new Audio("sounds/start.wav"); 
const EAT_SOUND = new Audio("sounds/eat_dot.wav");

EAT_SOUND.volume = 0.5;

// Slike
const MAZE_IMG = new Image();
MAZE_IMG.src = "img/maze.svg";

const PACMAN_OPEN_IMG = new Image();
PACMAN_OPEN_IMG.src = "img/pacman-open.png";

const PACMAN_CLOSED_IMG = new Image();
PACMAN_CLOSED_IMG.src = "img/pacman-closed.png";

// --- NASTAVITVE ---
const DOT_SIZE = 8;
const PACMAN_SIZE = 20;

const MARGIN_TOP = 15;
const MARGIN_LEFT = -10;
const STEP = 26.5; // Razmik med središči celic (800 px / 30 celic)

const ANIMATION_SPEED = 100;    // Hitrost v ms 
const MOUTH_SPEED = 120;        // Koliko ms naj slika ostane zamenjana

// --- STANJE IGRE ---
let lastUpdateTime = 0;     // Čas zadnje posodobitve
let isMouthClosed = false;  // Stanje ust na začetku
let animationId; 
let isRunning = false;
let imagesLoaded = 0;

// Celotna pot
const moves = "3L,1D,2L,1U,1L,2D,1L,2U,1L,1D,1L,1U,2L,2D,2L,2U,1L,6D,1R,1D,1L,2D,1R,1U,1R,2U,2R,1D,1R,1U,1R,1D,1R,1D,1L,1D,1R,1D,3R,1U,1R,1D,1R,1D,5L,3D,2R,1D,1L,2D,1L,2U,1L,3U,3L,1D,2R,1D,1L,2D,1R,1D,1L,3D,1R,1D,1L,1D,1L,1U,2L,2U,1R,1D,1R,2U,3L,5D,3R,1D,1R,1U,2R,1D,2R,1D,4R,1U,4R,1U,1R,1D,1R,2D,1R,1D,2L,2U,2L,1D,2L,1D,1L,1D,1R,1D,1R,1U,1R,2D";
const moveList = moves.split(",");

let startX = 15;
let startY = 0;
let dots = [];
let directions = ["L"]; // Začetna smer za rotacijo
let pacmanPos = { x: startX, y: startY, dir: "L" };

// Točke 
let score = 0;
const scoreVal = document.getElementById("score-val");
const finalScore = document.getElementById("final-score");
const overlay = document.getElementById("game-over-overlay");

// Inicializacija podatkov (pokličemo takoj)
resetData();

function resetData() {
    let curX = startX;
    let curY = startY;
    dots = [[startX, startY]];
    directions = ["L"]; 

    moveList.forEach(move => {
        const dir = move.slice(-1);
        const steps = parseInt(move.slice(0, -1));
        for (let i = 0; i < steps; i++) {
            if (dir === "L") curX--;
            else if (dir === "R") curX++;
            else if (dir === "U") curY--;
            else if (dir === "D") curY++;
            dots.push([curX, curY]);
            directions.push(dir);
        }
    });
    pacmanPos = { x: startX, y: startY, dir: "L" };
}

// Logika za zapiranje na klik
closeBtn.addEventListener('click', () => {
    overlayElement.style.display = "none";
    resetGame();
});
// --- POMOŽNE FUNKCIJE ZA RISANJE ---

function getCanvasCoords(cx, cy) {
    return {
        x: MARGIN_LEFT + (cx * STEP),
        y: MARGIN_TOP + (cy * STEP)
    };
}

function drawStaticScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(MAZE_IMG, 0, 0, canvas.width, canvas.height);
    drawDots();
    drawPacman();
}

function drawDots() {
    ctx.fillStyle = "yellow";
    dots.forEach(([cx, cy]) => {
        const coords = getCanvasCoords(cx, cy);
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, DOT_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawPacman() {
    const coords = getCanvasCoords(pacmanPos.x, pacmanPos.y);
    const angles = { "L": Math.PI, "U": -Math.PI / 2, "D": Math.PI / 2, "R": 0 };
    
    ctx.save();
    ctx.translate(coords.x, coords.y);
    ctx.rotate(angles[pacmanPos.dir] || 0);
    ctx.drawImage(isMouthClosed ? PACMAN_CLOSED_IMG : PACMAN_OPEN_IMG, -PACMAN_SIZE / 2, -PACMAN_SIZE / 2, PACMAN_SIZE, PACMAN_SIZE);
    ctx.restore();
}
// --- TOČKOVANJE IN GAME OVER ---
function showGameOver() {
    finalScoreElement.innerText = score;
    gameOverOverlay.style.display = "flex";
}

// --- LOGIKA IGRE ---
function gameLoop(timestamp) {
    if (!isRunning) return;

    if (timestamp - lastUpdateTime > ANIMATION_SPEED) {
        if (dots.length > 0) {
            // Shranimo vrednosti, ki jih vzamemo iz seznamov
            const nextPoint = dots.shift(); 
            const nextDir = directions.shift();
            
            // .cloneNode().play() omogoča, da se zvok prekriva, če se Pacman premika hitro
            EAT_SOUND.cloneNode().play();

            // Točkovanje
            score += 10;
            scoreVal.innerText = score;

            pacmanPos.x = nextPoint[0];
            pacmanPos.y = nextPoint[1];

            pacmanPos.dir = nextDir;
            isMouthClosed = !isMouthClosed; 
        } else {
            isRunning = false;
            finalScore.innerText = score;
            overlay.style.display = "flex";
        }
        lastUpdateTime = timestamp;
    }
    
    if (isMouthClosed && (timestamp - lastUpdateTime > MOUTH_SPEED)) {
        isMouthClosed = false;
    }

    drawStaticScene();
    animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
    if (!isRunning && dots.length > 0) {
        // 1. Predvajaj zvok takoj ob kliku
        START_SOUND.play();
        
        // 2. Nastavi stanje na "running", da gumbi vedo, da se je začelo vendar ne kličemo še requestAnimationFrame
        isRunning = true; 
        
        // 3. Počakaj 4000 milisekund (4 sekunde) preden se dejansko začne premikanje
        setTimeout(() => {
            if (isRunning) { // Preverimo, če vmes nismo pritisnili Reset
                lastUpdateTime = performance.now(); 
                requestAnimationFrame(gameLoop);
            }
        }, 4000);
    }
}

function resetGame() {
    isRunning = false;
    cancelAnimationFrame(animationId);

    // Ustavi začetni zvok in ga postavi na začetek
    START_SOUND.pause();
    START_SOUND.currentTime = 0;

    score = 0;
    scoreVal.innerText = "0";
    overlay.style.display = "none";

    resetData(); 
    drawStaticScene();
}

// Nalaganje
function checkLoad() {
    imagesLoaded++;
    if (imagesLoaded === 3) drawStaticScene();
}
MAZE_IMG.onload = checkLoad;
PACMAN_OPEN_IMG.onload = checkLoad;
PACMAN_CLOSED_IMG.onload = checkLoad;