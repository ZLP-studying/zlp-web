'use strict';

let player = "X";
let gameOver = false;

function init() {
    let board = document.getElementById("board");
    for (let i = 0; i < 9; i++) {
        let elem = document.createElement('div');
        elem.className = "cell";
        board.append(elem);
    }
    return board;
}

function displayMessage(message, type = "success") {
    let messageDiv = document.querySelector(".messages");
    let newMessage = document.createElement('div');
    newMessage.textContent = message;
    newMessage.className = "message";
    newMessage.className += " " + type;
    messageDiv.append(newMessage);
    setTimeout(() => {
        newMessage.remove();
    }, 3000);
}

function checkRows(cells) {
    for (let i = 0; i < 3; i++) {
        let firstCell = cells[i * 3];
        let win = true;
        if (firstCell.textContent === "")
            continue;
        for (let j = 1; j < 3; j++) {
            if (cells[i * 3 + j].textContent !== firstCell.textContent) {
                win = false;
                break;
            }
        }
        if (win) {
            return true;
        }
    }
    return false;
}

function checkColumns(cells) {
    for (let i = 0; i < 3; i++) {
        let firstCell = cells[i];
        let win = true;
        if (firstCell.textContent === "")
            continue;
        for (let j = 1; j < 3; j++) {
            if (cells[j * 3 + i].textContent !== firstCell.textContent) {
                win = false;
                break;
            }
        }
        if (win) {
            return true;
        }
    }
    return false;
}

function checkDiagonals(cells) {
    let topLeft = cells[0];
    let win = true;
    if (topLeft.textContent !== "") {
        for (let i = 1; i < 3; i++) {
            if (cells[i * 3 + i].textContent !== topLeft.textContent) {
                win = false;
                break;
            }
        }
        if (win)
            return true;
    }
    win = true;
    let topRight = cells[2];
    if (topRight.textContent !== "") {
        for (let i = 1; i < 3; i++) {
            if (cells[i * 3 + (2 - i)].textContent !== topRight.textContent) {
                win = false;
                break;
            }
        }
        return win;
    }
    return false;
}

function isFull(cells) {
    for (let i = 0; i < 9; i++)
        if (cells[i].textContent === "")
            return false;
    return true;
}

function checkForEndCondition(cell) {
    let target = cell.closest("#board");
    if (!gameOver && target.id === "board") {
        let cells = target.children;
        let doWeWin = checkRows(cells) || checkColumns(cells)
            || checkDiagonals(cells);
        if (doWeWin) {
            gameOver = true;
            displayMessage("Победил " + ((player === "X") ? "0" : "X"));
            return;
        }
        if (isFull(cells)) {
            displayMessage("Ничья");
        }
    }
}

function clickHandler(event) {
    let target = event.target;

    if (target.className === "cell") {
        if (gameOver) {
            displayMessage("Игра завершена", "error");
            return;
        }
        if (target.innerHTML !== "") {
            displayMessage("Ячейка занята", "error");
            return;
        }
        target.innerHTML = player;
        player = (player === "X") ? "0" : "X";
        checkForEndCondition(target);
    }
}

function resetGame() {
    let cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        cell.textContent = "";
    });
    player = "X";
    gameOver = false;
}

window.onload = function () {
    let board = init();
    board.addEventListener("click", clickHandler);
    let reload = document.querySelector(".btn");
    reload.addEventListener("click", resetGame);
};