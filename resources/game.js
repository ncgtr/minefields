document.addEventListener('DOMContentLoaded', () => {
    const COLS = 20;
    const ROWS = 20;
    const TOTAL_MINES = 96;
    const TOTAL_SAFE_CELLS = (COLS * ROWS) - TOTAL_MINES;
    
    const blocks = Array.from(document.querySelectorAll('.block'));
    let board = [];
    let firstClick = true;
    let gameOver = false;
    let revealedSafeCells = 0;

    const classMap = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];

    function initGame() {
        board = [];
        firstClick = true;
        gameOver = false;
        revealedSafeCells = 0;

        blocks.forEach((block, index) => {
            const r = Math.floor(index / COLS);
            const c = index % COLS;
            
            block.className = 'block hidden';
            
            board.push({
                element: block,
                index: index,
                row: r,
                col: c,
                isMine: false,
                adjacentMines: 0,
                revealed: false,
                flagged: false
            });
        });
    }

    blocks.forEach((block, index) => {
        block.addEventListener('click', () => handleLeftClick(index));
        
        block.addEventListener('contextmenu', (e) => {
            e.preventDefault(); 
            handleRightClick(index);
        });
    });

    function handleLeftClick(index) {
        if (gameOver) return;
        const cell = board[index];
        
        if (cell.flagged) return;

        if (cell.revealed) {
            chordCell(index);
            return;
        }

        if (firstClick) {
            firstClick = false;
            generateMines(index);
            calculateAdjacencies();
        }

        if (cell.isMine) {
            endGame(false);
            return;
        }

        revealCell(index);

        if (revealedSafeCells === TOTAL_SAFE_CELLS) {
            endGame(true);
        }
    }

    function handleRightClick(index) {
        if (gameOver) return;
        const cell = board[index];
        
        if (!cell.revealed) {
            cell.flagged = !cell.flagged;
            cell.element.classList.toggle('flagged', cell.flagged);
        }
    }

    function chordCell(index) {
        const cell = board[index];
        if (cell.adjacentMines === 0) return;

        const neighbors = getNeighbors(index);
        let flagCount = 0;

        neighbors.forEach(neighborIndex => {
            if (board[neighborIndex].flagged) flagCount++;
        });

        if (flagCount === cell.adjacentMines) {
            neighbors.forEach(neighborIndex => {
                const neighbor = board[neighborIndex];
                if (!neighbor.revealed && !neighbor.flagged) {
                    handleLeftClick(neighborIndex); 
                }
            });
        }
    }

    function getNeighbors(index) {
        const cell = board[index];
        const neighbors = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = cell.row + dr;
                const nc = cell.col + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                    neighbors.push(nr * COLS + nc);
                }
            }
        }
        return neighbors;
    }

    function generateMines(startCellIndex) {
        const forbiddenIndices = new Set();
        forbiddenIndices.add(startCellIndex);
        getNeighbors(startCellIndex).forEach(n => forbiddenIndices.add(n));

        let minesPlaced = 0;
        while (minesPlaced < TOTAL_MINES) {
            const randomIndex = Math.floor(Math.random() * board.length);
            if (!forbiddenIndices.has(randomIndex) && !board[randomIndex].isMine) {
                board[randomIndex].isMine = true;
                minesPlaced++;
            }
        }
    }

    function calculateAdjacencies() {
        for (let i = 0; i < board.length; i++) {
            if (board[i].isMine) continue;
            let count = 0;
            getNeighbors(i).forEach(neighborIndex => {
                if (board[neighborIndex].isMine) count++;
            });
            board[i].adjacentMines = count;
        }
    }

    function revealCell(index) {
        const cell = board[index];
        if (cell.revealed || cell.isMine || cell.flagged) return;

        cell.revealed = true;
        revealedSafeCells++;
        
        cell.element.classList.remove('hidden');
        cell.element.classList.add('shown', classMap[cell.adjacentMines]);

        if (cell.adjacentMines === 0) {
            getNeighbors(index).forEach(neighborIndex => revealCell(neighborIndex));
        }
    }

    function endGame(isWin) {
        gameOver = true;
        
        board.forEach(cell => {
            if (cell.isMine) {
                cell.element.classList.remove('hidden');
                cell.element.classList.add('shown', 'mine');
            }
        });

        setTimeout(() => {
            if (isWin) {
                alert("Congratulations! You cleared the minefield! 🏆");
            } else {
                alert("Boom! Game Over! 💥");
            }
            initGame();
        }, 15);
    }

    initGame();
});