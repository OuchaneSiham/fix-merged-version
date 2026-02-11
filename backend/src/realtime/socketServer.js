const { Server } = require("socket.io");
const prisma = require('../config/db.js');

class SocketServer {
  constructor() {
    this.io = null;
    this.users = new Map();
    this.onlineUsers = new Set();
  }

  async init(fastify) {
    this.io = new Server(fastify.server, {
      cors: {
        origin: ["https://localhost:8443", "http://localhost:8080", "*"],
        credentials: true,
      },
    });
    this.io.use(async (socket, next) => {
      const token = socket.handshake.auth?.token;
      
      if (!token) {
        return next(new Error("Authentication token required"));
      }

      try {
        const decoded = fastify.jwt.verify(token);
        socket.user = decoded;
        next();
      } catch (err) {
        console.error("Socket auth error:", err.message);
        next(new Error("Invalid token"));
      }
    });

    this.io.on("connection", async (socket) => {
      const userId = socket.user.id;
      
      this.users.set(userId, socket.id);
      this.onlineUsers.add(userId);
        try {
          await prisma.user.update({
            where: { id: userId },
            data: { isOnline: true },
          });
        } catch (error) {
          if (error.code === 'P2025') {
            console.warn(`⚠️ Socket connected for user ${userId}, but user not found in DB.`);
          } else {
            console.error("Error updating online status:", error);
          }
        }

      this.io.emit("user:online", { userId });
      socket.on("join_chat", (conversationId) => {
        const roomName = `chat_${conversationId}`;
        socket.join(roomName);
        console.log(`👤 User ${userId} joined room: ${roomName}`);
      });

      socket.on("disconnect", async () => {
        this.users.delete(userId);
        this.onlineUsers.delete(userId);

        try {
            await prisma.user.update({
              where: { id: userId },
              data: { isOnline: false }
            });
            console.log(`🔴 User ${userId} disconnected`);
          } catch (err) {
            if (err.code === 'P2025') {
              console.warn(`⚠️ User ${userId} was not in DB during disconnect.`);
            } else {
              console.error("Error updating offline status:", err);
            }
          }
        this.io.emit("user:offline", { userId });
      });
    });
  }

  getIO() { return this.io; }
  getSocketIdFromUserId(userId) { return this.users.get(userId); }
  isUserOnline(userId) { return this.onlineUsers.has(userId); }
}

module.exports = SocketServer;