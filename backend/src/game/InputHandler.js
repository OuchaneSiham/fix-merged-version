
class InputHandler {
  player1;
  player2;
  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
  }
  handleInput(playerId, action) {
    const player =
      playerId === this.player1.getPlayerId() ? this.player1 : this.player2;

    if (!player) return;
    if (action === "MOVE_UP") player.setInput("MOVE_UP", true);
    if (action === "MOVE_DOWN") player.setInput("MOVE_DOWN", true);
  }
}
// export default InputHandler;
module.exports = InputHandler
