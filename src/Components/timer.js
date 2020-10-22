import React from 'react';
class Timer extends React.Component {
    state = {
        timerOn: false,
        timerStart: 0,
        time: 0,
    };

    eventHandler() {
        if(this.props.playing && !this.state.timerOn) {
            this.resetTimer();
            this.startTimer();
        } else if(this.state.timerOn && !this.props.playing) {
            this.stopTimer();
        }
    }

    startTimer = () => {
        this.setState({
            timerOn: true,
            timerStart: Date.now() - this.state.time,
            time: this.state.time,
        });

        this.timer = setInterval(() => {
            this.setState({
                time: Date.now() - this.state.timerStart
            });
        }, 1000)
    }

    stopTimer = () => {
        this.setState({
            timerOn: false,
        });
        clearInterval(this.timer);
    }

    resetTimer = () => {
        this.setState({
            time: 0,
            timerStart: 0
        });
    }

    render() {
        return (
            <div className="timer">
                {this.eventHandler()}
                {this.state.time / 1000}
            </div>
        )
    }
}

export default Timer;