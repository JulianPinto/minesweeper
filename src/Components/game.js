import React from 'react';
import * as Constants from '../constants.js';
import Timer from './timer.js';
import flag from '../Images/flag.png'
import bomb from '../Images/bomb.png'
import square from '../Images/square.png'
import '../style.css';

function array2d(nrows, ncols, val) {
    const res = [];
    for (let row = 0; row < nrows; row++) {
        res[row] = [];
        for (let col = 0; col < ncols; col++)
            res[row][col] = val(row, col);
    }
    return res;
}

// returns random integer in range [min, max]
function rndInt(min, max) {
    [min, max] = [Math.ceil(min), Math.floor(max)]
    return min + Math.floor(Math.random() * (max - min + 1));
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            nmarked: 0,
            nuncovered: 0,
            exploded: false,
            gameState: Constants.NOT_STARTED,
            startTime: 0,
            arr: array2d(
                props.difficulty[0], props.difficulty[1],
                () => ({ mine: false, state: Constants.STATE_HIDDEN, count: 0 })),
        }

        this.validCoord = this.validCoord.bind(this);
        this.count = this.count.bind(this);
        this.sprinkleMines = this.sprinkleMines.bind(this);
        this.uncover = this.uncover.bind(this);
        this.mark = this.mark.bind(this);
        this.getRendering = this.getRendering.bind(this);
        this.getStatus = this.getStatus.bind(this);
        this.spaceReleased = this.spaceReleased.bind(this);
        this.spaceClicked = this.spaceClicked.bind(this);
    }

    componentDidUpdate() {
        if(this.state.arr.length !== this.props.difficulty[0]) {
            this.resetGame();
        }
    }

    resetGame() {
        this.setState({
            nmarked: 0,
            nuncovered: 0,
            exploded: false,
            gameState: Constants.NOT_STARTED,
            arr: array2d(
                this.props.difficulty[0], this.props.difficulty[1],
                () => ({ mine: false, state: Constants.STATE_HIDDEN, count: 0 })),
            gameState: Constants.NOT_STARTED,
            time: 0,
        })
    }

    validCoord(row, col) {
        return row >= 0 && row < this.props.difficulty[0] && col >= 0 && col < this.props.difficulty[1];
    }

    count(row, col) {
        const c = (r, c) =>
            (this.validCoord(r, c) && this.state.arr[r][c].mine ? 1 : 0);
        let res = 0;
        for (let dr = -1; dr <= 1; dr++)
            for (let dc = -1; dc <= 1; dc++)
                res += c(row + dr, col + dc);
        return res;
    }
    sprinkleMines(row, col) {
        // prepare a list of allowed coordinates for mine placement
        let allowed = [];
        for (let r = 0; r < this.props.difficulty[0]; r++) {
            for (let c = 0; c < this.props.difficulty[1]; c++) {
                if (Math.abs(row - r) > 2 || Math.abs(col - c) > 2)
                    allowed.push([r, c]);
            }
        }
        this.props.difficulty[2] = Math.min(this.props.difficulty[2], allowed.length);
        for (let i = 0; i < this.props.difficulty[2]; i++) {
            let j = rndInt(i, allowed.length - 1);
            [allowed[i], allowed[j]] = [allowed[j], allowed[i]];
            let [r, c] = allowed[i];
            this.state.arr[r][c].mine = true;
        }
        // erase any marks (in case user placed them) and update counts
        for (let r = 0; r < this.props.difficulty[0]; r++) {
            for (let c = 0; c < this.props.difficulty[1]; c++) {
                if (this.state.arr[r][c].state == Constants.STATE_MARKED)
                    this.state.arr[r][c].state = Constants.STATE_HIDDEN;
                this.state.arr[r][c].count = this.count(r, c);
            }
        }
        let mines = []; let counts = [];
        for (let row = 0; row < this.props.difficulty[0]; row++) {
            let s = "";
            for (let col = 0; col < this.props.difficulty[1]; col++) {
                s += this.state.arr[row][col].mine ? "B" : ".";
            }
            s += "  |  ";
            for (let col = 0; col < this.props.difficulty[1]; col++) {
                s += this.state.arr[row][col].count.toString();
            }
            mines[row] = s;
        }
        console.log("Mines and counts after sprinkling:");
        console.log(mines.join("\n"), "\n");
    }
    // uncovers a cell at a given coordinate
    // this is the 'left-click' functionality
    uncover(row, col) {
        console.log("uncover", row, col);
        // if coordinates invalid, refuse this request
        if (!this.validCoord(row, col)) return false;
        // if this is the very first move, populate the mines, but make
        // sure the current cell does not get a mine
        if (this.state.nuncovered === 0) {
            this.sprinkleMines(row, col);
            this.state.startTime = Date.now();
            this.state.gameState = Constants.PLAYING;
        }
        // if cell is not hidden, ignore this move
        if (this.state.arr[row][col].state !== Constants.STATE_HIDDEN) return false;
        // floodfill all 0-count cells
        const ff = (r, c) => {
            if (!this.validCoord(r, c)) return;
            if (this.state.arr[r][c].state !== Constants.STATE_HIDDEN) return;
            this.state.arr[r][c].state = Constants.STATE_SHOWN;
            this.state.nuncovered++;
            if (this.state.arr[r][c].count !== 0) return;
            ff(r - 1, c - 1); ff(r - 1, c); ff(r - 1, c + 1);
            ff(r, c - 1);; ff(r, c + 1);
            ff(r + 1, c - 1); ff(r + 1, c); ff(r + 1, c + 1);
        };
        ff(row, col);
        // have we hit a mine?
        if (this.state.arr[row][col].mine) {
            this.state.exploded = true;
        }
        return true;
    }
    // puts a flag on a cell
    // this is the 'right-click' or 'long-tap' functionality
    mark(row, col) {
        console.log("mark", row, col);
        // if coordinates invalid, refuse this request
        if (!this.validCoord(row, col)) return false;
        // if cell already uncovered, refuse this
        console.log("marking previous state=", this.state.arr[row][col].state);
        if (this.state.arr[row][col].state === Constants.STATE_SHOWN) return false;
        // accept the move and flip the marked status
        this.state.nmarked += this.state.arr[row][col].state == Constants.STATE_MARKED ? -1 : 1;
        this.state.arr[row][col].state = this.state.arr[row][col].state == Constants.STATE_MARKED ?
            Constants.STATE_HIDDEN : Constants.STATE_MARKED;
        return true;
    }
    // returns array of strings representing the rendering of the board
    //      "H" = hidden cell - no bomb
    //      "F" = hidden cell with a mark / flag
    //      "M" = uncovered mine (game should be over now)
    // '0'..'9' = number of mines in adjacent cells
    getRendering() {
        const res = [];
        for (let row = 0; row < this.props.difficulty[0]; row++) {
            let s = "";
            for (let col = 0; col < this.props.difficulty[1]; col++) {
                let a = this.state.arr[row][col];
                if (this.state.exploded && a.mine) s += "M";
                else if (a.state === Constants.STATE_HIDDEN) s += "H";
                else if (a.state === Constants.STATE_MARKED) s += "F";
                else if (a.mine) s += "M";
                else s += a.count.toString();
            }
            res[row] = s;
        }
        return res;
    }

    getStatus() {
        let done = this.state.exploded ||
            this.state.nuncovered === this.props.difficulty[0] * this.props.difficulty[1] - this.props.difficulty[2];
        return {
            done: done,
            exploded: this.state.exploded,
            nrows: this.props.difficulty[0],
            ncols: this.props.difficulty[1],
            nmarked: this.state.nmarked,
            nuncovered: this.state.nuncovered,
            nmines: this.props.difficulty[2]
        }
    }

    getImage(item) {
        if (item === "H")
            return <img src={square} alt="square"></img>
        else if (item === "F")
            return <img src={flag} alt="flag"></img>
        else if (item === "M")
            return <img src={bomb} alt="bomb"></img>
        else {
            return <img src={Constants.numberToImage(item)} alt={item}></img>
        }
    }

    spaceClicked(rindex, cindex) {
        this.longPress = false;
        this.clickTimer = setTimeout(() => {
            if(this.mark(rindex, cindex))
                this.forceUpdate();
            this.longPress = true;
        }, 1000);
        return () => clearTimeout(this.clickTimer);
    }

    spaceReleased(rindex, cindex) {
        clearTimeout(this.clickTimer);
        if (!this.longPress) {
            if(this.uncover(rindex, cindex))
                this.forceUpdate();
            const gameStatus = this.getStatus();
            if(gameStatus.exploded)
                this.state.gameState = Constants.GAME_LOSS;
            else if(gameStatus.done && !gameStatus.exploded)
                this.state.gameState = Constants.GAME_WIN;
        }
    }

    displayMessage() {
        if(this.state.gameState === Constants.GAME_LOSS)
            return "GAME OVER";
        else if(this.state.gameState === Constants.GAME_WIN)
            return "Congratulations you win!";
        else if(this.state.gameState === Constants.PLAYING)
            return "...tick tock...";
        else return;
    }

    renderBoard() {
        return (
            <div className="board">
                {this.getRendering().map((row, rindex) => (
                    <div className="row" key={rindex}>{
                        row.split('').map((item, cindex) => (
                            <div key={cindex}
                                className="space"
                                onTouchStart={() => {this.spaceClicked(rindex, cindex)}}
                                onTouchEnd={() => {this.spaceReleased(rindex, cindex)}}
                                onMouseDown={() => {this.spaceClicked(rindex, cindex)}}
                                onMouseUp={() => {this.spaceReleased(rindex, cindex)}}>
                                    {this.getImage(item)}
                            </div>
                        ))}</div>
                ))}
            </div>

        )
    }

    renderGameStats() {
        let gameState = this.getStatus();
        return (
            <div className="status_bar">
                <button className="reset" onClick={() => {
                    this.resetGame();
                    this.forceUpdate();
                }}>Reset</button>
                <div id="flag_count">
                    <img src={flag} alt="flag"></img>
                    : {gameState.nmines - gameState.nmarked}
                </div>
                <Timer key={this.state.gameState} playing={this.state.gameState === Constants.PLAYING}></Timer>
            </div>
        )
    }

    render() {
        return (
            <div>
                {this.renderGameStats()}
                <div className="game">
                    {this.renderBoard()}
                </div>
        <h2 className="gameResult">{this.displayMessage()}</h2>
            </div>
        )
    }
}

export default Game;