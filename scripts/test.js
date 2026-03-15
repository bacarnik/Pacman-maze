const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Slike
const mazeImg = new Image();
mazeImg.src = "img/maze.svg";

const pacmanImg = new Image();
pacmanImg.src = "img/pacman-open.svg";

// --- NASTAVITVE ZA PORAVNAVO (Umerjeno na 800x800) ---
const GRID_CELLS = 30;
const DOT_SIZE = 8;
const PACMAN_SIZE = 24; // Velikost Pac-Mana na platnu

const MARGIN_TOP = 15;     // Razdalja od vrha canvasa do sredine prve vrstice
const MARGIN_LEFT = -10;   // Razdalja od levega roba canvasa do sredine prvega stolpca
const STEP = 26.5;         // Razmik med središči celic

const ANIMATION_SPEED = 1000; // Hitrost v ms (manj je hitreje)
// -----------------------------------------------------

// Celotna pot (tvoji moves)
const moves = "3L,1D,2L,1U,1L,2D,1L,2U,1L,1D,1L,1U,2L,2D,2L,2U,1L,6D,1R,1D,1L,2D,1R,1U,1R,2U,2R,1D,1R,1U,1R,1D,1R,1D,1L,1D,1R,1D,3R,1U,1R,1D,1R,1D,5L,3D,2R,1D,1L,2D,1L,2U,1L,3U,3L,1D,2R,1D,1L,2D,1R,1D,1L,3D,1R,1D,1L,1D,1L,1U,2L,2U,1R,1D,1R,2U,3L,5D,3R,1D,1R,1U,2R,1D,2R,1D,4R,1U,4R,1U,1R,1D,1R,2D,1R,1D,2L,2U,2L,1D,2L,1D,1L,1D,1R,1D,1R,1U,1R,2D";
const moveList = moves.split(",");

let startX = 15;
let startY = 0;

let dots = [[startX, startY]];

const directions = ["L"]; // Smer za rotacijo
let pacmanPos = { x: startX, y: startY, dir: "L" };

let curX = startX;
let curY = startY;

// Seznam pojetih pikic (indeksi iz path)
const eatenDots = new Set();

// Priprava koordinat
moveList.forEach(move => {
    const dir = move.slice(-1);
    const steps = parseInt(move.slice(0, -1));
    for (let i = 0; i < steps; i++) {
        if (dir === "L") curX--;
        if (dir === "R") curX++;
        if (dir === "U") curY--;
        if (dir === "D") curY++;

        dots.push([curX, curY]);
        directions.push(dir);
    }
});

let currentStep = 0;
let lastUpdateTime = 0;

function getCanvasCoords(cx, cy) {
    return {
        x: MARGIN_LEFT + (cx * STEP),
        y: MARGIN_TOP + (cy * STEP)
    };
}

// Glavna zanka animacije
function gameLoop(timestamp) {
    //pacmanImg.src = "img/pacman-open.svg"; 
    if (timestamp - lastUpdateTime > ANIMATION_SPEED) {
        if (dots.length > 0) {
            // .shift() vzame prvo pikico in jo IZBRIŠE iz seznama
            const nextPoint = dots.shift(); 
            
            // Posodobimo pozicijo in smer Pacmana
            pacmanPos.x = nextPoint[0];
            pacmanPos.y = nextPoint[1];
            pacmanPos.dir = directions.shift();

            // Zamenjava slike
            pacmanImg.src = "img/pacman-closed.svg"; 
        }
        lastUpdateTime = timestamp;
    }

    // 1. Čiščenje
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Labirint
    ctx.drawImage(mazeImg, 0, 0, canvas.width, canvas.height);

    // 3. Vse pikice (ostanejo na mestu)
    drawDots();

    // 4. Pac-Man
    drawPacman();

    requestAnimationFrame(gameLoop);
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
    const dir = pacmanPos.dir;

    let angle = 0;
    if (dir === "L") angle = Math.PI;
    if (dir === "U") angle = -Math.PI / 2;
    if (dir === "D") angle = Math.PI / 2;

    ctx.save();
    ctx.translate(coords.x, coords.y);
    ctx.rotate(angle);
    ctx.drawImage(pacmanImg, -PACMAN_SIZE / 2, -PACMAN_SIZE / 2, PACMAN_SIZE, PACMAN_SIZE);
    ctx.restore();
}

// Zagon ko sta obe sliki pripravljeni
let loadedImages = 0;
function checkLoad() {
    loadedImages++;
    if (loadedImages === 2) requestAnimationFrame(gameLoop);
}
mazeImg.onload = checkLoad;
pacmanImg.onload = checkLoad;
