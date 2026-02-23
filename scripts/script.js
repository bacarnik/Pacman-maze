const dotsGroup = document.getElementById('pacman-dots');

const GRID_SIZE = 16;
const dotSize = 8;

// ročni fine-tuning pozicije
const OFFSET_X = -13;
const OFFSET_Y = 3;

// tvoja pot
const moves = "3L,1D,2L,1U,1L,2D,1L,2U,1L,1D,1L,1U,2L,2D,2L,2U,1L,6D,1R,1D,1L,2D,1R,1U,1R,2U,2R,1D,1R,1U,1R,1D,1R,1D,1L,1D,1R,1D,3R,1U,1R,1D,1R,1D,5L,3D,2R,1D,1L,2D,1L,2U,1L,3U,3L,1D,2R,1D,1L,2D,1R,1D,1L,3D,1R,1D,1L,1D,1L,1U,2L,2U,1R,1D,1R,2U,3L,5D,3R,1D,1R,1U,2R,1D,2R,1D,4R,1U,4R,1U,1R,1D,1R,2D,1R,1D,2L,2U,2L,1D,2L,1D,1L,1D,1R,1D,1R,1U,1R,2D";

const moveList = moves.split(',');

// start: zgoraj na sredini
let x = 15;
let y = 0;

const path = [[x, y]];

// izračun poti
moveList.forEach(move => {
  const dir = move.slice(-1);
  const steps = parseInt(move.slice(0, -1));

  for (let i = 0; i < steps; i++) {
    if (dir === 'U') y--;
    if (dir === 'D') y++;
    if (dir === 'L') x--;
    if (dir === 'R') x++;
    path.push([x, y]);
  }
});

// izris kvadratkov z offsetom
path.forEach((point, index) => {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  
    rect.setAttribute("x", point[0] * GRID_SIZE + (GRID_SIZE - dotSize) / 2 + OFFSET_X);
    rect.setAttribute("y", point[1] * GRID_SIZE + (GRID_SIZE - dotSize) / 2 + OFFSET_Y);
    rect.setAttribute("width", dotSize);
    rect.setAttribute("height", dotSize);
    rect.classList.add("dot");
  
    // smer gibanja (za slide-in)
    if (index > 0) {
      const prev = path[index - 1];
      rect.style.setProperty("--dx", point[0] - prev[0]);
      rect.style.setProperty("--dy", point[1] - prev[1]);
    }
  
    dotsGroup.appendChild(rect);
  
    // animacija z zamikom
    setTimeout(() => {
      rect.classList.add("show");
    }, index * 35);
});


// pacman 
  
pacman.setAttribute("x", 240);
pacman.setAttribute("y", 155);

/*
let pacIndex = 0;
const pacman = document.getElementById('pacman');
function movePacman() {
    if (pacIndex >= path.length) return;
  
    const [px, py] = path[pacIndex];
    const tx = px * GRID_SIZE + GRID_SIZE/2 - 16; // -16 da centriramo image
    const ty = py * GRID_SIZE + GRID_SIZE/2 - 16;
  
    pacman.setAttribute("x", tx);
    pacman.setAttribute("y", ty);
  
    pacIndex++;
    requestAnimationFrame(movePacman);
  }
  
  movePacman();*/