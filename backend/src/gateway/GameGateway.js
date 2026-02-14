const jwt = require("jsonwebtoken");
const { GameStatus } = require("../game/GameState");
const {
  ClientMessageType,
  ServerMessageType,
} = require("../messages/messages");
const { WebSocketServer } = require("ws");
const GameClient = require("../game/GameClient");
const dotenv = require("dotenv");
const GameEngine = require("../game/GameEngine");

dotenv.config();
// import GameEngine from "../game/GameEngine.js";

// Change the constructor in GameGateway.js
class GameGateway {
  wss;
  rooms = new Map();
  frameIntervals = new Map();

  // backend/src/gateway/GameGateway.js
  constructor(server) {
    // Remove the trailing slash from the path
    this.wss = new WebSocketServer({
      server,
      path: "/game",
    });

    this.wss.on("connection", (socket, request) => {
      this.handleConnection(socket, request);
    });
    console.log(`✅ GameGateway attached to main server on /game`);
  }
  // ... rest of the code stays the same

  handleConnection(socket, request) {
    const url = request.url;
    const params = new URLSearchParams((url || "")?.split("?")[1] || "");
    const token = params.get("token");
    // const roomId = params.get("roomId") || "default-room";
    const roomId = params.get("roomId");
    const isAiRoom = roomId?.startsWith("ai-");
    if (!token) {
      socket.send(
        JSON.stringify({
          type: ServerMessageType.AUTHENTIFICATION,
          message: "Authentication required",
        }),
      );
      socket.close(1008, "Unauthorized");
      return;
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_KEY);
    } catch {
      socket.send(
        JSON.stringify({
          type: ServerMessageType.AUTHENTIFICATION,
          message: "Invalid token",
        }),
      );
      socket.close(1008, "Invalid token");
      return;
    }

    // ✅ Extract real user info from JWT
    const userId = payload.id || payload.sub;
    const username = payload.username || payload.email || `user_${userId}`;

    if (!this.rooms.has(roomId)) {
      // Create room if it doesn't exist
      const engine = new GameEngine();
      if (isAiRoom) {
        engine.enableAI();
      }
      this.rooms.set(roomId, {
        engine,
        clients: new Map(),
        aiAdded: isAiRoom, // To control extra users
      });
      this.startRoomLoop(roomId);
    }

    const room = this.rooms.get(roomId);
    const clients = room.clients;
    const engine = room.engine;

    // Check for reconnection
    const existingClient = [...clients.values()].find(
      (c) => c.userId === userId,
    );
    const playersDisconnected = [...clients.values()].filter(
      (c) => c.getRole() === "PLAYER" && c.isDisconnected(),
    );
    // const playersConnected = [...clients.values()].filter(
    //   (c) => c.getRole() === "PLAYER" && !c.isDisconnected(),
    // );
    if (existingClient && playersDisconnected.length > 0) {
      playersDisconnected.forEach((p) => {
        if (p.getClientId() !== existingClient.getClientId()) {
          p.setRole("SPECTATOR");
          p.setClientId(null);
        }
      });
    }
    // if (playersDisconnected.length === 1) {
    //   if (
    //     playersDisconnected[0].getClientId() !== existingClient?.getClientId()
    //   ) {
    //     // if (playersConnected === 1) {
    //       const disconnectedPlayerId = playersDisconnected[0].getClientId();
    //       playersDisconnected[0].setRole("SPECTATOR");
    //       playersDisconnected[0].setClientId(null);
    //       existingClient.setRole("PLAYER");
    //       existingClient.setClientId(disconnectedPlayerId);
    //       // playersDisconnected[0].setRole("SPECTATOR");
    //       // playersDisconnected[0].setClientId(null);
    //     }
    //   } else {
    //     playersDisconnected[0].setRole("SPECTATOR");
    //     playersDisconnected[0].setClientId(null);
    //   }
    // }
    if (existingClient) {
      console.log(`Reconnecting client ${userId} in room ${roomId}`);
      const oldEntry = [...clients.entries()].find(
        ([_, c]) => c === existingClient,
      );
      if (oldEntry) clients.delete(oldEntry[0]);

      // const playersConnected = [...clients.values()].filter(
      //   (c) => c.getRole() === "PLAYER" && !c.isDisconnected(),
      // );
      existingClient.socket = socket;
      existingClient.setDisconnected(false);
      clients.set(socket, existingClient);

      if (engine.state.status === GameStatus.PAUSED) {
        setTimeout(() => {
          const playersConnected = [...clients.values()].filter(
            (c) => c.getRole() === "PLAYER" && !c.disconnected,
          ).length;
          console.log(
            "Client Reconnected",
            playersConnected,
            engine.isAIEnabled,
          );
          const playersReady = [...clients.values()].filter((c) =>
            c.getIsReady(),
          ).length;
          if (
            !engine.gamePaused &&
            ((playersConnected === 2 && playersReady === 2) ||
              (playersConnected === 1 && engine.isAIEnabled))
          ) {
            engine.state.status = GameStatus.RUNNING;
          }
        }, 3000);
      }
      this.sendSnapshotToClient(existingClient, roomId);
      this.assignSocketListeners(socket, existingClient, roomId);
      return;
    }

    // Assign role
    let playerCount = [...clients.values()].filter(
      (c) => c.getRole() === "PLAYER",
    ).length;
    let newClient;
    if (room.aiAdded && engine.state.status === GameStatus.RUNNING) {
      newClient = new GameClient(
        userId,
        socket,
        "SPECTATOR",
        roomId,
        undefined,
        undefined,
      );
      clients.set(socket, newClient);
      socket.send(
        JSON.stringify({
          type: ServerMessageType.ASSIGN_ROLE,
          role: "SPECTATOR",
        }),
      );
      return;
    }
    if (playerCount < 2) {
      const playerId = playerCount === 0 ? "player1" : "player2";
      newClient = new GameClient(
        userId,
        socket,
        "PLAYER",
        roomId,
        playerId,
        username,
      );
      clients.set(socket, newClient);
      socket.send(
        JSON.stringify({ type: ServerMessageType.ASSIGN_ID, playerId }),
      );
      if (engine.aiTimeout && !isAiRoom) {
        clearTimeout(engine.aiTimeout);
        engine.aiTimeout = null;
        engine.disableAI();
      }
      console.log("AI", playerCount, engine.aiTimeout);
      if (
        engine.state.status === GameStatus.WAITING_OPPONENT &&
        !engine.aiTimeout
      ) {
        engine.aiTimeout = setTimeout(() => {
          const currentPlayers = [...clients.values()].filter(
            (c) => c.getRole() === "PLAYER" && c.getIsReady(),
          ).length;
          if (currentPlayers === 1) {
            console.log("No opponent found enabling AI in room", roomId);
            engine.enableAI();
            room.aiAdded = true; // Denied access to other clients
            console.log("AI added to room", roomId);
            this.checkGameStart(roomId);
          }
          engine.aiTimeout = null;
        }, 60000);
      }
    } else {
      newClient = new GameClient(
        userId,
        socket,
        "SPECTATOR",
        roomId,
        undefined,
        username,
      );
      clients.set(socket, newClient);
    }
    socket.send(
      JSON.stringify({
        type: ServerMessageType.ASSIGN_ROLE,
        role: newClient.getRole(),
      }),
    );

    this.assignSocketListeners(socket, newClient, roomId);
    this.sendSnapshotToClient(newClient, roomId);
  }

  assignSocketListeners(socket, client, roomId) {
    socket.on("message", (data) =>
      this.handleMessage(socket, data.toString(), roomId),
    );
    socket.on("close", () => {
      console.log(
        `Client ${client.getClientId()} disconnected from room ${roomId}`,
      );
      const room = this.rooms.get(roomId);
      const engine = room.engine;
      client.setDisconnected(true);
      if (client.getRole() === "PLAYER") {
        engine.disconnectedClient = client;
        engine.onPlayerDisconnected(client.getClientId(), room.clients);
      }
    });
  }

  handleMessage(socket, data, roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const client = room.clients.get(socket);
    if (!client) return;

    let payload;
    try {
      payload = JSON.parse(data);
    } catch {
      console.error("Failed to parse message");
      return;
    }

    switch (payload.type) {
      case ClientMessageType.PLAYER_READY:
        if (client.getRole() === "PLAYER") {
          client.setIsReady(true);
          this.checkGameStart(roomId);
        }
        break;
      case ClientMessageType.PLAYER_INPUT:
        if (
          client.getRole() === "PLAYER" &&
          room.engine.state.status === GameStatus.RUNNING
        ) {
          room.engine.handlePlayerInput(client.getClientId(), payload.action);
        }
        break;
      case ClientMessageType.PLAYER_INPUT_STOP:
        if (
          client.getRole() === "PLAYER" &&
          room.engine.state.status === GameStatus.RUNNING
        ) {
          room.engine.handlePlayerInputStop(client.getClientId());
        }
        break;
      case ClientMessageType.PAUSE_GAME:
        if (client.getRole() === "PLAYER") {
          room.engine.pauseGame(client.getClientId());
        }
        break;
      case ClientMessageType.RESUME_GAME:
        if (client.getRole() === "PLAYER") {
          room.engine.resumeGame();
        }
        break;
      default:
        console.log("Unknown message type");
    }
  }

  checkGameStart(roomId) {
    const room = this.rooms.get(roomId);
    const engine = room.engine;
    const clients = room.clients;
    if (engine.waitingOpponentTimeout) {
      clearTimeout(engine.waitingOpponentTimeout);
      engine.waitingOpponentTimeout = null;
    }
    const readyPlayers = [...clients.values()].filter(
      (c) => c.getRole() === "PLAYER" && c.getIsReady(),
    );

    // Check if the AI is enabled
    const aiEnabled = engine.isAIEnabled;
    // const isAiRoom = roomId.startsWith("ai-");
    // if (isAiRoom) {
    //   clients.forEach((c) => {
    //     c.setIsReady(true);
    //   });
    // }

    if (
      readyPlayers.length === 2 ||
      (readyPlayers.length === 1 &&
        aiEnabled &&
        (engine.state.status === GameStatus.WAITING ||
          engine.state.status === GameStatus.WAITING_OPPONENT))
    ) {
      engine.startGame();
      // Immediately send the snapshot to avoid sync problems
      this.broadcastSnapshot(roomId);
    } else if (
      readyPlayers.length === 1 &&
      engine.state.status === GameStatus.WAITING &&
      !aiEnabled
    ) {
      engine.state.status = GameStatus.WAITING_OPPONENT;
    }
  }

  // This function executes a game loop for each room
  startRoomLoop(roomId) {
    const room = this.rooms.get(roomId);
    const isAiRoom = roomId.startsWith("ai-");
    const engine = room.engine;

    const FPS = 60;
    let lastUpdateTime = Date.now();
    let resetScheduled = false;

    const interval = setInterval(() => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - lastUpdateTime) / 1000;
      lastUpdateTime = currentTime;

      engine.update(deltaTime, isAiRoom);
      this.broadcastSnapshot(roomId);

      // When a game is finished,
      // check if there at least one player
      // and if he is ready and after 1 minutes
      // introduce AI opponent if no one has joined
      // the room.
      const clients = room.clients;
      const players = [...clients.values()].filter(
        (c) => c.getRole() === "PLAYER" && !c.isDisconnected(),
      );
      if (
        players.length == 2 &&
        engine.state.status === GameStatus.WAITING_OPPONENT &&
        !engine.waitingOpponentTimeout
      ) {
        engine.waitingOpponentTimeout = setTimeout(() => {
          players.forEach((p) => p.setIsReady(false));
          engine.state.status = GameStatus.WAITING;
          engine.waitingOpponentTimeout = null;
        }, 60000);
      }
      if (
        engine.state.status === GameStatus.WAITING_OPPONENT &&
        !engine.aiTimeout &&
        players.length === 1 &&
        !isAiRoom
      ) {
        engine.aiTimeout = setTimeout(() => {
          const currentPlayers = [...clients.values()].filter(
            (c) => c.getRole() === "PLAYER" && c.getIsReady(),
          );
          if (currentPlayers.length === 1) {
            const playerToControlId =
              currentPlayers[0].getClientId() === "player1"
                ? "player2"
                : "player1";
            console.log("No opponent found enabling AI in room", roomId);
            engine.enableAI(playerToControlId);
            room.aiAdded = true; // Denied access to other clients
            console.log("AI added to room", roomId);
            this.checkGameStart(roomId);
          }
          engine.aiTimeout = null;
        }, 60000);
      }
      // resetScheduled is used to avoid
      // multiple resets being scheduled
      // when the game is finished but clients
      // haven't left the room yet
      if (engine.state.status === GameStatus.FINISHED && !resetScheduled) {
        resetScheduled = true;
        setTimeout(() => {
          resetScheduled = false;
          if (!isAiRoom) {
            room.aiAdded = false;
            engine.disableAI();
          }
          engine.resetGame();
          room.clients.forEach((c) => c.setIsReady(false));
          this.broadcastSnapshot(roomId);
        }, 10000);
      }
    }, 1000 / FPS);

    this.frameIntervals.set(roomId, interval);
  }

  broadcastSnapshot(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    const snapshot = room.engine.getSnapshot();
    room.clients.forEach((client) =>
      this.sendSnapshotToClient(client, roomId, snapshot),
    );
  }

  sendSnapshotToClient(client, roomId, snapshot = null) {
    const room = this.rooms.get(roomId);
    const engine = room.engine;
    if (!snapshot) snapshot = engine.getSnapshot();
    const data = { type: ServerMessageType.GAME_SNAPSHOT, snapshot };

    if (client.getRole() === "PLAYER") {
      const id = client.getClientId();
      const players = [...room.clients.values()].filter(
        (c) => c.getRole() === "PLAYER",
      );
      const opponent = players.find((p) => p.getClientId() !== id);
      const opponentId = opponent?.getClientId();

      client.send({
        ...data,
        snapshot: {
          ...data.snapshot,
          you: id,
          [id]: { ...data.snapshot[id], ready: client.getIsReady() },
          [opponentId]: {
            ...data.snapshot[opponentId],
            ready: opponent?.getIsReady(),
          },
          aiEnabled: engine.isAIEnabled,
        },
      });
    } else {
      client.send({
        ...data,
        snapshot: { ...data.snapshot, you: "SPECTATOR" },
      });
    }
  }
}

// export default GameGateway;
module.exports = GameGateway;
