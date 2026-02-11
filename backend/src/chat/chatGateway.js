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
}

module.exports = ChatGateway;