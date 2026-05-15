
let board = [];
let size = {
    col: 8,
    row: 8,
    mine: 8
};

// returns deep freeze copy of board state
function getBoard() {
    let copy = [];
    for (let i = 0; i < size.row; i++) {
        copy[i] = Object.freeze({ ...board[i] });
    }
    return copy;
}

// builds out state information of board
function buildBoard() {
    let board = [];

    _build_empty();

    _place_mines();
}

// erases board and rebuilds using size
function _build_empty() {
    for (let i = 0; i < size.col; i++) {
        board[i] = [];
        for (let j = 0; j < size.row; j++) {
            board[i][j] = {
                is_mine: false,
                adjacent: 0,
                is_revealed: false,
                is_flagged: false
            };
        }
    }
}

// places mines in a presumably empty board using size
function _place_mines() {
    for (let i = 0; i < size.mine; i++) {
        let col = -1;
        let row = -1;

        let attempt_numb = 0;
        let catastrophic_cap = 1000;
        
        // generate coordinates that don't already have a mine
        while (col == -1 || row == -1) {
            if (col == -1) {
                col = Math.floor(Math.random() * size.col);
            }
            
            if (row == -1) {
                row = Math.floor(Math.random() * size.row);
            }

            if (board[col][row].is_mine) {
                col = -1;
                row = -1;
            }
            attempt_numb++;
            
            // give up to keep things from looping potentially forever
            if (attempt_numb >= catastrophic_cap) {
                break;
            }
        }

        if (col == -1 || row == -1) {
            break;
        }

        board[col][row].is_mine = true;
        _increment_adjacent(col, row);
    }
}

// given a location, increment adjacent values assuming location is a mine
function _increment_adjacent(col, row) {
    for (let i = col - 1; i <= col + 1; i++) {
        for (let j = row - 1; j <= row + 1; j++) {
            // check for out of bounds
            if (i < 0 || i >= size.col || j < 0 || j >= size.row) {
                continue;
            }

            // check if is a mine
            if (board[i][j].is_mine) {
                continue;
            }

            // increment adjacent
            board[i][j].adjacent++;
        }
    }
}