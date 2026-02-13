const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const cors = require('@fastify/cors');
const fastify = require('fastify')({ logger: false });
const multipart = require('@fastify/multipart');
const static = require('@fastify/static');
const prisma = require('./config/db'); 
const SocketServer = require("./realtime/socketServer");
const ChatGateway = require("./chat/chatGateway");
const ChatService = require("./chat/chatService");
const chatController = require("./chat/chatController");
const jwtw = require("./routes/plugin");
const userRoutes = require("./routes/user-route");

// ✅ Import GameGateway
const GameGateway = require("./gateway/GameGateway");

fastify.register(cors, {
    hook: 'preHandler',
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
});

fastify.register(multipart);
fastify.register(static, {
    root: path.join(__dirname, "..", 'uploads'),
    prefix: "/uploads/"
});

fastify.register(jwtw);
fastify.register(userRoutes, { prefix: "/api/v1/users" });

// Chat WebSocket
const socketServer = new SocketServer();
socketServer.init(fastify);

const chatGateway = new ChatGateway(socketServer);
const chatService = new ChatService(prisma, chatGateway);

fastify.register(async (instance) => {
    instance.register(chatController(chatService));
}, { prefix: "/api/v1/chat" });

const start = async () => {
    try {
        await fastify.listen({
            port: 8281,
            host: '0.0.0.0'
        });
        
        // ✅ Attach Game Gateway to the SAME port (8281)
        // fastify.server is the raw Node.js HTTP server
        const gameGateway = new GameGateway(fastify.server);
        
        console.log(`
        🚀  MERGED PROJECT BACKEND
        -------------------------
        ✅  HTTP & Game WS Port: 8281
        ✅  Chat WebSockets: Running (Socket.io)
        ✅  Game WebSockets: Running (WS) on /game/
        `);
    } catch (err) {
        console.error("❌ Error starting server:", err);
        process.exit(1);
    }
};

// When refreshing the page on /game 
// the frontend will try to connect to ws or wss:localhost:8281/game 
// the server has no HTTP route for /game but it has a WS route for /game
// so the browser will make an HTTP request (GET) /game which will return 404,
// so to solve this we can add a simple HTTP route for /game that just returns 200 OK,
// this way the WS upgrade request will succeed and the WebSocket connection will be established.
// A websocket connection starts with an HTTP request that includes an "Upgrade" header.
// A WebSocket route is different from an HTTP route.
// fastify.get('/game', (req, res) => {
//     res.status(200).send('WebSocket endpoint for game connections');
// });
start();