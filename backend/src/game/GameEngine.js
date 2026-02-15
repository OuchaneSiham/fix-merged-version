const Ball = require("./Ball");
const { GameState, GameStatus } = require("./GameState");
const InputHandler = require("./InputHandler");
const Paddle = require("./Paddle");
const Player = require("./Player");

class GameEngine {
  fieldWidth = 800;
  fieldHeight = 600;
  ball;
  player1;
  player2;
  state;
  disconnectedClient;
  inputHandler;
  aiTimeout = null;
  waitingOpponentTimeout = null;
  isAIEnabled = false;
  aiDifficulty = "normal";
  aiTimer = 0;
  gamePaused = false;
  pausedByPlayerId = null;
  matchStats = {
    winnerUserId: null,
    loserUserId: null,
    winnerScore: 0,
    loserScore: 0,
    roomId: null,
    matchId: null,
    date: null,
  };
  events = []; // To emit a sound effect on the client when a collision occurs
  constructor() {
    this.ball = new Ball(this.fieldWidth / 2, this.fieldHeight / 2, 300);
    this.player1 = new Player(
      "player1",
      new Paddle(0, this.fieldHeight / 2 - 50, 10, 100, 500),
    );
    this.player2 = new Player(
      "player2",
      new Paddle(this.fieldWidth - 10, this.fieldHeight / 2 - 50, 10, 100, 500),
    );
    this.state = new GameState();
    this.inputHandler = new InputHandler(this.player1, this.player2);
    this.disconnectedClient = null;
    this.waitingOpponentTimeout = null;
    this.gamePaused = false;
    this.pausedByPlayerId = null;
  }
  checkScore(isAiRoom, roomClients, roomId) {
    const score1 = this.player1.getPlayerScore();
    const score2 = this.player2.getPlayerScore();
    if (this.ball.getState().x + this.ball.getState().radius < 0) {
      this.player2.incrementScore();
      this.ball.resetSpeed(300);
      this.ball.reset();
    }
    if (
      this.ball.getState().x - this.ball.getState().radius >
      this.fieldWidth
    ) {
      this.player1.incrementScore();
      this.ball.resetSpeed(300);
      this.ball.reset();
    }
    if (score1 >= this.state.maxScore) {
      this.endGame("player1", isAiRoom, roomClients, roomId);
      return;
    }
    if (score2 >= this.state.maxScore) {
      this.endGame("player2", isAiRoom, roomClients, roomId);
      return;
    }
  }
  update(deltaTime, isAiRoom, roomClients, roomId) {
    if (this.state.status !== GameStatus.RUNNING) return;
    this.updatePlayers(deltaTime);
    this.ball.update(deltaTime);
    if (this.isAIEnabled) {
      this.updateAI(deltaTime);
    }
    this.checkWallCollisions();
    this.checkPaddleCollisions();
    this.checkScore(isAiRoom, roomClients, roomId);
  }
  updatePlayers(deltaTime) {
    if (this.player1.input.up && !this.player1.isAi) {
      const paddle = this.player1.getPlayerPaddle();
      if (paddle.getBounds().y > 0) {
        paddle.moveUp(deltaTime);
      }
    }
    if (this.player1.input.down && !this.player1.isAi) {
      const paddle = this.player1.getPlayerPaddle();
      if (paddle.getBounds().y + paddle.getBounds().height < this.fieldHeight) {
        paddle.moveDown(deltaTime);
      }
    }
    if (this.player2.input.up && !this.player2.isAi) {
      const paddle = this.player2.getPlayerPaddle();
      if (paddle.getBounds().y > 0) {
        paddle.moveUp(deltaTime);
      }
    }
    if (this.player2.input.down && !this.player2.isAi) {
      const paddle = this.player2.getPlayerPaddle();
      if (paddle.getBounds().y + paddle.getBounds().height < this.fieldHeight) {
        // console.log("PLAYER 2 MOVE_DOWN", this.player2.input.down);
        paddle.moveDown(deltaTime);
      }
    }
  }
  // Call this method to set the control
  // of the player to AI
  enableAI(playerId = "player2") {
    this.isAIEnabled = true;
    const player = playerId === "player1" ? this.player1 : this.player2;
    player.isAi = true;
    this.player2.input.up = false;
    this.player2.input.down = false;
  }
  disableAI() {
    this.isAIEnabled = false;
    this.player1.isAi = false;
    this.player2.isAi = false;
  }
  updateAI(deltaTime) {
    const iaPlayer = this.player1.isAi ? this.player1 : this.player2;
    const paddle = iaPlayer.getPlayerPaddle();
    const ball = this.ball.getState();
    const paddleCenter = paddle.y + paddle.height / 2;
    const tolerance = 20;
    const aiSpeed = 0.9;
    const reactionTime = 0.09;
    const maxError = 25;
    this.aiTimer += deltaTime;
    if (this.aiTimer < reactionTime) {
      return;
    }
    this.aiTimer = 0;

    let targetY;
    if (this.ball.getVelocity().vx > 0) {
      const error = Math.random() - 0.5 * maxError;
      targetY = ball.y + error;
    } else {
      targetY = this.fieldHeight / 2;
    }
    if (targetY > paddleCenter + tolerance) {
      if (paddle.getBounds().y + paddle.getBounds().height < this.fieldHeight) {
        paddle.moveDown(deltaTime * aiSpeed);
      }
    } else if (targetY < paddleCenter - tolerance) {
      if (paddle.getBounds().y > 0) {
        paddle.moveUp(deltaTime * aiSpeed);
      }
    }
  }
  touchPaddle(paddle) {
    const radius = this.ball.getState().radius;
    const ball = this.ball.getState();
    const pad = paddle.getBounds();
    return (
      ball.x + radius >= pad.x &&
      ball.x - radius <= pad.x + pad.width &&
      ball.y + radius >= pad.y &&
      ball.y - radius <= pad.y + pad.height
    );
  }
  checkWallCollisions() {
    const radius = this.ball.getState().radius;
    if (
      this.ball.getState().y - radius <= 0 ||
      this.ball.getState().y + radius >= this.fieldHeight
    ) {
      //   console.log("Wall collision detected at y =", this.ball.getState().y);
      this.events.push({ type: "BALL_HIT_WALL" }); // Wall hit event
      this.ball.bounceY();
    }
  }
  checkPaddleCollisions() {
    const leftPaddle = this.player1.getPlayerPaddle();
    const rightPaddle = this.player2.getPlayerPaddle();
    if (this.touchPaddle(leftPaddle) && this.ball.getVelocity().vx < 0) {
      this.events.push({ type: "BALL_HIT_PADDLE" }); // Paddle hit event
      this.ball.bounceX();
      this.ball.setSpeed(1.05);
      this.ball.setPosition(
        leftPaddle.getBounds().x +
          leftPaddle.getBounds().width +
          this.ball.getState().radius,
      );
    }
    if (this.touchPaddle(rightPaddle) && this.ball.getVelocity().vx > 0) {
      this.events.push({ type: "BALL_HIT_PADDLE" });
      this.ball.bounceX();
      this.ball.setSpeed(1.05);
      this.ball.setPosition(
        rightPaddle.getBounds().x - this.ball.getState().radius,
      );
    }
  }
  getSnapshot() {
    const snapshot = {
      ball: this.ball.getState(),
      player1: {
        x: this.player1.getPlayerPaddle().getBounds().x,
        y: this.player1.getPlayerPaddle().getBounds().y,
        width: this.player1.getPlayerPaddle().getBounds().width,
        height: this.player1.getPlayerPaddle().getBounds().height,
        score: this.player1.getPlayerScore(),
      },
      player2: {
        x: this.player2.getPlayerPaddle().getBounds().x,
        y: this.player2.getPlayerPaddle().getBounds().y,
        width: this.player1.getPlayerPaddle().getBounds().width,
        height: this.player1.getPlayerPaddle().getBounds().height,
        score: this.player2.getPlayerScore(),
      },
      field: { width: this.fieldWidth, height: this.fieldHeight },
      status: GameStatus[this.state.status],
      winnerId: this.state.winnerId ?? null,
      gamePaused: this.gamePaused,
      pausedByPlayerId: this.pausedByPlayerId,
      events: [...this.events],
    };
    this.events.length = 0; // Clear events after sending the snapshot
    return snapshot;
  }
  handlePlayerInput(playerId, action) {
    const data = this.getSnapshot();
    this.inputHandler.handleInput(playerId, action, data);
  }
  handlePlayerInputStop(playerId) {
    const player =
      playerId === this.player1.getPlayerId() ? this.player1 : this.player2;
    if (!player) return;
    player.setInput("MOVE_UP", false);
    player.setInput("MOVE_DOWN", false);
  }
  endGame(winnerId, isAiRoom, roomClients, roomId) {
    // if (this.state.status === GameStatus.FINISHED) return;
    this.state.finish();
    this.state.winnerId = winnerId;
    this.disconnectedClient = null;
    if (this.isAIEnabled && !isAiRoom) this.disableAI();
    if (!isAiRoom && !this.player1.isAi && !this.player2.isAi) {
      // First find players in roomClients
      const players = [...roomClients.values()].filter(
        (c) => c.getRole() === "PLAYER",
      );
      const winnerClient = players.find((p) => p.getClientId() === winnerId);
      const loserClient =
        winnerClient.getClientId() === "player1"
          ? players.find((p) => p.getClientId() === "player2")
          : players.find((p) => p.getClientId() === "player1");
      this.matchStats.winnerUserId = winnerClient.getUserId();
      this.matchStats.loserUserId = loserClient?.getUserId();
      this.matchStats.winnerScore = this.state.maxScore;
      this.matchStats.loserScore =
        winnerId === "player1"
          ? this.player2.getPlayerScore()
          : this.player1.getPlayerScore();
      this.matchStats.roomId = roomId;
      this.matchStats.matchId = `${roomId}-${Date.now()}`;
      this.matchStats.date = new Date().toISOString();
    }
  }
  onPlayerDisconnected(playerId, roomClients) {
    if (this.state.status === GameStatus.WAITING) {
      return;
    }
    const players = [...roomClients.values()].filter(
      (c) => c.getRole() === "PLAYER",
    );
    // const disconnectedPlayers = players.filter(
    //   (p) => p.isDisconnected()
    // )
    if (this.state.status === GameStatus.WAITING_OPPONENT) {
      if (players.length === 2) {
        setTimeout(() => {
          this.state.status = GameStatus.WAITING;
          players.forEach((p) => p.setIsReady(false));
        }, 180000);
      }
      return;
    }

    this.state.status = GameStatus.PAUSED;
    console.log("On player disconnected:", playerId);
    setTimeout(() => {
      if (
        this.disconnectedClient &&
        this.disconnectedClient.getClientId() === playerId &&
        this.disconnectedClient.isDisconnected() &&
        this.state.status !== GameStatus.FINISHED
      ) {
        const winnerId = playerId === "player1" ? "player2" : "player1";
        this.endGame(winnerId);
      }
    }, 5000);
  }
  startGame() {
    this.state.status = GameStatus.RUNNING;
  }
  pauseGame(playerId) {
    if (this.state.status === GameStatus.RUNNING) {
      this.state.status = GameStatus.PAUSED;
      this.gamePaused = true;
      this.pausedByPlayerId = playerId;
    }
  }
  resumeGame() {
    if (this.state.status === GameStatus.PAUSED) {
      this.state.status = GameStatus.RUNNING;
      this.gamePaused = false;
      this.pausedByPlayerId = null;
    }
  }
  resetGame() {
    this.state.status = GameStatus.WAITING;
    this.state.winnerId = null;
    this.player1.score = 0;
    this.player2.score = 0;
    this.ball.reset();
    this.events = [];
    this.matchStats = {
      winnerUserId: null,
      loserUserId: null,
      winnerScore: 0,
      loserScore: 0,
      roomId: null,
      matchId: null,
      date: null,
    };
    this.player1.resetPlayer(this.fieldHeight / 2 - 50);
    this.player2.resetPlayer(this.fieldHeight / 2 - 50);
    this.player1.setInput("MOVE_UP", false);
    this.player1.setInput("MOVE_DOWN", false);
    this.player2.setInput("MOVE_UP", false);
    this.player2.setInput("MOVE_DOWN", false);
  }
  getMatchStats() {
    return this.matchStats;
  }
}
module.exports = GameEngine;
