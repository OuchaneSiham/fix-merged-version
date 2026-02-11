const GameStatus = {
    WAITING_OPPONENT: "WAITING_OPPONENT",
    WAITING: "WAITING",
    RUNNING: "RUNNING",
    PAUSED: "PAUSED",
    FINISHED: "FINISHED"
};

class GameState {
    constructor() {
        this.status = GameStatus.WAITING;
        this.winnerId = null;
        this.maxScore = 5;
        this.maxPlayers = 2;
    }

    start() {
        this.status = GameStatus.RUNNING;
    }

    pause() {
        this.status = GameStatus.PAUSED;
    }

    finish() {
        this.status = GameStatus.FINISHED;
    }

    reset() {
        this.status = GameStatus.WAITING;
        this.winnerId = null;
    }
}

module.exports = {
    GameState,
    GameStatus
};
