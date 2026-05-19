class tile {
    constructor () {
        this.is_mine = false;
        this.adjacent = false;
        this.revealed = false;
        this.flagged = false;
    }
}

export { tile };