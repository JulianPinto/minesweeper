import React from 'react';
import Game from './Components/game.js';
import * as Constants from './constants.js';
import './style.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            difficulty: Constants.EASY,
        }
        this.setToMedium = this.setToMedium.bind(this);
        this.setToEasy = this.setToEasy.bind(this);
    }

    setToMedium() {
        this.setState({ difficulty: Constants.MEDIUM })
    }

    setToEasy() {
        this.setState({ difficulty: Constants.EASY })
    }

    render = () => (
        <div className="App">
            <h1 className="AppName">MINESWEEPER</h1>
            <div class="gameSizes">
                <button className="gameOption" onClick={this.setToEasy}>Easy</button>
                <button className="gameOption" onClick={this.setToMedium}>Medium</button>
            </div>
            <Game key={this.state.difficulty[0]} difficulty={this.state.difficulty}>
            </Game>
        </div>
    )
}

export default App;