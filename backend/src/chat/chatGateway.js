// Changed path from ../realtime to ../realtime/socketServer
const SocketServer = require("../realtime/socketServer");

class ChatGateway {
  constructor(socketServer) {
    this.socketServer = socketServer;
  }

  handleEmitNewMessage(message) {
    if (!this.socketServer || !this.socketServer.getIO()) return;
    
    this.socketServer
      .getIO()
      .to(`chat_${message.conversationId}`)
      .emit("message:new", message);
  }
   // NEW: Emit block/unblock events
  emitBlockEvent(blockerId, blockedUserId, action) {
    if (!this.socketServer || !this.socketServer.getIO()) return;
    
    // Broadcast to all connected clients
    // Both the blocker and blocked user will receive this
    this.socketServer
      .getIO()
      .emit("block:update", {
        blockerId,
        blockedUserId,
        action // 'blocked' or 'unblocked'
      });
  } //siham
}

module.exports = ChatGateway;