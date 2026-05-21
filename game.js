import { new_board, query, size } from './board.js';
import { tile } from './tile.js';
import * as readline from 'readline';

let mines_active = 0;
let flags = 0;
let seconds = 0.0;
let game_started = false;

const input_re = /^([A-Za-z])(?:\s+(\d{1,2}))?(?:\s+(\d{1,2}))?$/;

async function start() {
    _welcome();
    let input = "";

    while(true) {
        input = await _get_input();
        input = input.trim();
        input = input.match(input_re);
        _parse_input(input);
    }
}

function _get_input() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => rl.question('> ', ans => {
        rl.close();
        resolve(ans);
    }))
}

function _parse_input(match) {
    if (!match) {
        _error_input();
        return;
    }

    const command = match[1];
    const arg1 = parseInt(match[2], 10);
    const arg2 = parseInt(match[3], 10);

    switch(command) {
        case "h": _help(); break;
        case "q": _quit(); break;
        case "d": _display(); break;
        case "n": _new(arg1); break;
        case "r": _reveal(arg1, arg2); break;
        case "f": _flag(arg1, arg2); break;
        default: _error_input(); break;
    }
}

function _new(new_size) {
    if (!new_size) {
        _error_input();
        return;
    }

    let col = 8;
    let row = 8;
    let mines = 8;
    game_started = true;

    switch(new_size) {
        case 1:
            col = 8;
            row = 4;
            mines = 5;
            break;
        case 2:
            col = 12;
            row = 6;
            mines = 8;
            break;
        case 3:
            col = 16;
            row = 8;
            mines = 12;
            break;
        case 4:
            col = 20;
            row = 10;
            mines = 15;
            break;
        default:
            console.log('Invalid size argument. Try again?');
            return;
    }

    mines_active = mines;
    flags = 0;
    new_board(col, row, mines);
    _display();
}

function _reveal(x, y, top_loader=true) {
    if (!game_started) {
        console.log("No active game. Type \"n [size]\" for a new game.");
        return;
    }

    if (x < 0 || x > size.col || y < 0 || y > size.row) {
        console.log("Invalid grid coordinates given! Try again?");
        return;
    }

    let tile = query(x, y);

    if (tile.is_mine) {
        console.log("UH OH! NO! ACKHGH! mine bomb boom bomb");
        _quit();
        return;
    }

    if (tile.is_revealed) {
        console.log("Value is already revealed! Try again?");
        return;
    }

    tile.is_revealed = true;

    // recur
    if (tile.adjacent == 0) {
        for (let i = x - 1; i <= x + 1; i++) {
            for (let j = y - 1; j <= y + 1; j++) {
                if (i >= 0 && i < size.col && j >= 0 && j < size.row) {
                    _reveal(i, j, false);
                }
            }
        }
    }

    if (top_loader) {
        _display();
    }
}

function _flag(x, y) {
    if (!game_started) {
        console.log("No active game. Type \"n [size]\" for a new game.");
        return;
    }

    if (!x || !y) {
        _error_input();
        return;
    }

    if (x < 0 || x > size.col || y < 0 || y > size.row) {
        console.log("Invalid grid coordinates given! Try again?");
        return;
    }

    if (query(x, y).is_revealed) {
        console.log("Value is already revealed! Try again?");
        return;
    }

    query(x, y).is_flagged = true;
    _display();
}

function _quit() {
    console.log("Goodbye!");
    process.exit();   
}

function _error_input() {
    console.log("Not sure I understand what you were trying to input...");
    console.log("Try \"h\" for help with commands.");
}

function _welcome() {
    console.clear();
    console.log('WELCOME TO MINESWEEPER');
    console.log('Type \"h\" for controls.');
    console.log('To begin, type \"n [size]\" where size is 1,2,3, or 4.');
}

function _help() {
    console.clear();
    console.log('Type \"q\" to exit the game.');
    console.log('Type \"d\" to show the display again.');
    console.log('Type \"r [x][y]\" to reveal a tile.');
    console.log('Type \"f [x][y]\" to flag or unflag a tile.');
    console.log('Type \"n [size]\" to start a new game.');
    console.log('For sizes, use 1, 2, 3, or 4. This is for 8x4, 12x6, 16x8, and 20x10');
    console.log('To win: reveal every non-mine tile or flag every mine.');
    console.log('Game over happens when you reveal a tile which has a mine.');
    console.log('The numbers revealed show you how many mines are in total around the tile.');
}

function _display() {
    if (!game_started) {
        console.log("No active game. Type \"n [size]\" for a new game.");
        return;
    }

    console.clear();
    console.log(`minesweeper\t\t${flags} flags; ${mines_active - flags} left\t${seconds}`);
    
    let print_line = ""
    print_line = '   ';
    for (let i = 0; i < size.col; i++) {
        print_line += `${i} |`;
    }
    console.log(print_line);
    
    print_line = '===';
    for (let i = 0; i < size.col; i++) {
        print_line += '==='
    }
    console.log(print_line);

    for (let i = 0; i < size.row; i++) {
        print_line = `${i} |`
        for (let j = 0; j < size.col; j++) {
            let tile = query(j, i);
            if (tile.is_flagged) {
                print_line += '[?]';
            } else if (!tile.is_revealed) {
                print_line += '[_]';
            } else if (tile.adjacent == 0) {
                print_line += '[0]';
            } else {
                print_line += `[${tile.adjacent}]`;
            }
        }
        console.log(print_line);
    }
}

export { start };