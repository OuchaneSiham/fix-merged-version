 class Player {
  id; // Unique identifier for the player
  score = 0; // Player's score
  paddle; // The paddle controlled by the player
  input = { up: false, down: false };
  isAi = false; // Flag to indicate if the player is controlled by AI
  constructor(id, paddle) {
    this.id = id;
    this.paddle = paddle;
  }
  setInput(action, value) {
    if (action === "MOVE_UP") this.input.up = value;
    if (action === "MOVE_DOWN") this.input.down = value;
  }
  getPlayerId() {
    return this.id;
  }
  getPlayerScore() {
    return this.score;
  }
  incrementScore() {
    this.score++;
  }
  getPlayerPaddle() {
    return this.paddle;
  }
  resetPlayer(y) {
    this.score = 0;
    this.getPlayerPaddle().reset(y);
  }
  setPlayerPaddle(paddle) {
    this.paddle = paddle;
  }
  movePaddleUp(deltaTime) {
    this.paddle.moveUp(deltaTime);
  }
  movePaddleDown(deltaTime) {
    this.paddle.moveDown(deltaTime);
  }
}
module.exports = Player