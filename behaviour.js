let player1Name = '';
let player2Name = '';
let currentPlayer = 1;
let gameActive = false;
let boardState = ['', '', '', '', '', '', '', '', ''];
let movesCount = 0;

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6]              
];

const player1Input = document.getElementById('player1');
const player2Input = document.getElementById('player2');
const startBtn = document.getElementById('start-btn');
const errorMessage = document.getElementById('error-message');
const currentPlayerDisplay = document.getElementById('current-player');
const cells = document.querySelectorAll('.cell');
const scoreboardBody = document.getElementById('scoreboard-body');


player1Input.addEventListener('input', validateInputs);
player2Input.addEventListener('input', validateInputs);
startBtn.addEventListener('click', startGame);

function validateInputs() {
    const p1 = player1Input.value.trim();
    const p2 = player2Input.value.trim();
    
    if (p1 !== '' && p2 !== '') {
        startBtn.disabled = false;
        errorMessage.style.display = 'none';
    } else {
        startBtn.disabled = true;
        if (p1 !== '' || p2 !== '') {
            errorMessage.style.display = 'block';
        }
    }
}

function startGame(e) {
    e.preventDefault();
    
    player1Name = player1Input.value.trim();
    player2Name = player2Input.value.trim();
    
    if (player1Name === '' || player2Name === '') {
        errorMessage.style.display = 'block';
        return;
    }
    
    boardState = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 1;
    movesCount = 0;
    gameActive = true;
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken');
        cell.addEventListener('click', handleCellClick);
    });
    
    updateCurrentPlayer();
    
    player1Input.disabled = true;
    player2Input.disabled = true;
    startBtn.disabled = true;
}

function updateCurrentPlayer() {
    const playerName = currentPlayer === 1 ? player1Name : player2Name;
    const symbol = currentPlayer === 1 ? 'X' : 'O';
    currentPlayerDisplay.textContent = `Current Player: ${playerName} (${symbol})`;
}

function handleCellClick(e) {
    if (!gameActive) return;
    
    const cell = e.target;
    const index = parseInt(cell.getAttribute('data-index'));
    
    if (boardState[index] !== '') {
        alert('This cell is already taken! Please choose another one.');
        return;
    }
    
   
    const symbol = currentPlayer === 1 ? 'X' : 'O';
    boardState[index] = symbol;
    cell.textContent = symbol;
    cell.classList.add('taken');
    movesCount++;
    
    if (checkWinner()) {
        const winner = currentPlayer === 1 ? player1Name : player2Name;
        setTimeout(() => {
            alert(`🎉 ${winner} wins the game!`);
            saveWinner(winner);
            endGame();
        }, 100);
        return;
    }
    
    if (movesCount === 9) {
        setTimeout(() => {
            alert('⚖️ It\'s a tie! No more moves available.');
            endGame();
        }, 100);
        return;
    }
    
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updateCurrentPlayer();
}

function checkWinner() {
    return winningCombinations.some(combination => {
        const [a, b, c] = combination;
        return boardState[a] !== '' && 
               boardState[a] === boardState[b] && 
               boardState[a] === boardState[c];
    });
}

function saveWinner(winnerName) {
    let leaderboard = getLeaderboard();
    
    const existingPlayer = leaderboard.find(player => player.name === winnerName);
    
    if (existingPlayer) {
        existingPlayer.wins++;
    } else {
        leaderboard.push({ name: winnerName, wins: 1 });
    }
    
    localStorage.setItem('tictactoe_leaderboard', JSON.stringify(leaderboard));
    
    updateLeaderboard();
}

function getLeaderboard() {
    const data = localStorage.getItem('tictactoe_leaderboard');
    return data ? JSON.parse(data) : [];
}

function updateLeaderboard() {
    let leaderboard = getLeaderboard();
    
    leaderboard.sort((a, b) => {
        if (b.wins !== a.wins) {
            return b.wins - a.wins;
        }
        return a.name.localeCompare(b.name);
    });
    
    const top5 = leaderboard.slice(0, 5);
    
    scoreboardBody.innerHTML = '';
    
    top5.forEach(player => {
        const row = document.createElement('tr');
        
        const nameCell = document.createElement('td');
        nameCell.textContent = player.name;
        
        const winsCell = document.createElement('td');
        winsCell.textContent = player.wins;
        
        row.appendChild(nameCell);
        row.appendChild(winsCell);
        scoreboardBody.appendChild(row);
    });
}

function endGame() {
    gameActive = false;
    cells.forEach(cell => {
        cell.removeEventListener('click', handleCellClick);
    });
    
    player1Input.disabled = false;
    player2Input.disabled = false;
    startBtn.disabled = false;
    startBtn.textContent = 'New Game';
}

document.addEventListener('DOMContentLoaded', () => {
    updateLeaderboard();
});