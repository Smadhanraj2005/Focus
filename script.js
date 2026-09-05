// Game Constants
const TOTAL_NUMBERS = 25;
const INITIAL_TIME = 30;

// Vibrant Color Palette matching reference design
const COLOR_PALETTE = [
    { bg: '#8b00ff', text: '#00ff00' }, // Purple / Green text
    { bg: '#ffd700', text: '#6b0080' }, // Yellow / Purple text
    { bg: '#0026ca', text: '#ffffff' }, // Deep Blue / White text
    { bg: '#00e5ff', text: '#e60000' }, // Cyan / Red text
    { bg: '#ff007f', text: '#ffffff' }, // Pink / White text
    { bg: '#e60000', text: '#ffff00' }, // Red / Yellow text
    { bg: '#008b28', text: '#ffffff' }, // Green / White text
    { bg: '#ff1493', text: '#00ff66' }, // Magenta / Mint text
    { bg: '#ff5500', text: '#000000' }, // Orange / Black text
    { bg: '#0026ca', text: '#ff3333' }, // Blue / Red text
    { bg: '#ffd700', text: '#cc0000' }, // Yellow / Red text
    { bg: '#00d5e6', text: '#0000cd' }, // Cyan / Blue text
    { bg: '#626d88', text: '#000000' }, // Slate / Black text
    { bg: '#e60000', text: '#ffff00' }, // Red / Yellow text
    { bg: '#ff007f', text: '#ffff00' }, // Pink / Yellow text
    { bg: '#f6ca9d', text: '#cc0000' }, // Peach / Red text
    { bg: '#008b28', text: '#0000ff' }, // Green / Blue text
    { bg: '#ffd700', text: '#000000' }, // Yellow / Black text
    { bg: '#ff5500', text: '#ffff00' }, // Orange / Yellow text
    { bg: '#8b00ff', text: '#ffffff' }, // Purple / White text
    { bg: '#00e5ff', text: '#000000' }, // Cyan / Black text
    { bg: '#ff007f', text: '#000000' }, // Pink / Black text
    { bg: '#0026ca', text: '#ffd700' }, // Blue / Yellow text
    { bg: '#ff5500', text: '#ffffff' }, // Orange / White text
    { bg: '#008b28', text: '#ffff00' }  // Green / Yellow text
];

// Game State
let currentTarget = 1;
let timeLeft = INITIAL_TIME;
let timerInterval = null;
let isGameActive = false;
let currentMode = 'bw'; // 'bw' or 'color'

// DOM Elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');

const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const modeToggleBtn = document.getElementById('mode-toggle-btn');
const modeBtns = document.querySelectorAll('.mode-btn');

const timerDisplay = document.getElementById('timer-display');
const targetDisplay = document.getElementById('target-display');
const numberGrid = document.getElementById('number-grid');

const endTitle = document.getElementById('end-title');
const endMessage = document.getElementById('end-message');
const endSubmessage = document.getElementById('end-submessage');

// Event Listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Mode Selection Listeners
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setGameMode(btn.dataset.mode);
    });
});

if (modeToggleBtn) {
    modeToggleBtn.addEventListener('click', () => {
        const newMode = currentMode === 'bw' ? 'color' : 'bw';
        setGameMode(newMode);
        if (isGameActive) {
            // Re-render grid with current numbers
            const currentTiles = Array.from(numberGrid.children);
            const numbers = currentTiles.map(t => parseInt(t.dataset.number));
            renderGrid(numbers);
        }
    });
}

function setGameMode(mode) {
    currentMode = mode;
    modeBtns.forEach(b => {
        b.classList.toggle('active', b.dataset.mode === mode);
    });
    if (modeToggleBtn) {
        modeToggleBtn.textContent = mode === 'bw' ? 'B & W' : 'COLOR';
    }
}

/**
 * Shuffles array in-place using Fisher-Yates algorithm
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Displays specified screen and hides others
 */
function showScreen(screenToShow) {
    [startScreen, gameScreen, endScreen].forEach(screen => {
        if (screen === screenToShow) {
            screen.classList.add('active');
        } else {
            screen.classList.remove('active');
        }
    });
}

/**
 * Initializes and starts a new game session
 */
function startGame() {
    // Reset state
    currentTarget = 1;
    timeLeft = INITIAL_TIME;
    isGameActive = true;
    clearInterval(timerInterval);

    // Update UI headers
    timerDisplay.textContent = timeLeft;
    targetDisplay.textContent = currentTarget;

    // Generate & shuffle numbers 1-25
    const numbers = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);
    shuffleArray(numbers);

    // Render grid
    renderGrid(numbers);

    // Show game screen
    showScreen(gameScreen);

    // Start timer countdown
    timerInterval = setInterval(tickTimer, 1000);
}

/**
 * Renders the 5x5 grid with numbers (B&W or Color mode)
 */
function renderGrid(numbers) {
    numberGrid.innerHTML = '';
    
    // Shuffle colors for Color mode
    const shuffledColors = shuffleArray([...COLOR_PALETTE]);
    
    numbers.forEach((num, index) => {
        const tile = document.createElement('button');
        tile.dataset.number = num;
        
        if (currentMode === 'color') {
            const colorPair = shuffledColors[index % shuffledColors.length];
            tile.className = 'tile tile-color';
            tile.style.backgroundColor = colorPair.bg;
            tile.style.color = colorPair.text;
        } else {
            // B&W Checkerboard pattern
            const row = Math.floor(index / 5);
            const col = index % 5;
            const isWhiteTile = (row + col) % 2 === 0;
            tile.className = `tile ${isWhiteTile ? 'tile-white' : 'tile-black'}`;
            tile.style.backgroundColor = '';
            tile.style.color = '';
        }

        tile.textContent = num;
        tile.addEventListener('click', () => handleTileClick(num, tile));
        
        numberGrid.appendChild(tile);
    });
}

/**
 * Handles tile click logic
 */
function handleTileClick(clickedNumber, tileElement) {
    if (!isGameActive) return;
    if (tileElement.classList.contains('inactive')) return;

    if (clickedNumber === currentTarget) {
        // Correct Number
        tileElement.classList.add('correct-flash');
        
        setTimeout(() => {
            tileElement.classList.remove('correct-flash');
            tileElement.classList.add('inactive');
        }, 80);

        if (currentTarget === TOTAL_NUMBERS) {
            winGame();
        } else {
            currentTarget++;
            targetDisplay.textContent = currentTarget;
        }
    } else {
        // Wrong Number
        tileElement.classList.remove('shake');
        // Trigger reflow to restart animation if clicked repeatedly
        void tileElement.offsetWidth;
        tileElement.classList.add('shake');

        setTimeout(() => {
            tileElement.classList.remove('shake');
        }, 300);
    }
}

/**
 * Timer tick function
 */
function tickTimer() {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
        loseGame();
    }
}

/**
 * Handles lose condition (timer reaches 0)
 */
function loseGame() {
    stopGame();
    
    endTitle.textContent = "TIME'S UP";
    const foundCount = currentTarget - 1;
    endMessage.textContent = `You found ${foundCount} / ${TOTAL_NUMBERS} numbers`;
    endSubmessage.textContent = '';
    
    showScreen(endScreen);
}

/**
 * Handles win condition (all 25 numbers found)
 */
function winGame() {
    stopGame();
    
    endTitle.textContent = "COMPLETE";
    endMessage.textContent = `You found all ${TOTAL_NUMBERS} numbers!`;
    endSubmessage.textContent = `Time remaining: ${timeLeft} seconds`;
    
    showScreen(endScreen);
}

/**
 * Stops active game and timer
 */
function stopGame() {
    isGameActive = false;
    clearInterval(timerInterval);
}
