const startBtn = document.getElementById('start-button');
const resetBtn = document.getElementById('reset-button');

startBtn.addEventListener('click', () => {
    // Pokličemo funkcijo, ki smo jo definirali v test.js
    startGame();
});

resetBtn.addEventListener('click', () => {
    // Pokličemo funkcijo za reset v test.js
    resetGame();
});