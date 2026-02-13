// import { useEffect, useState } from "react";
// import { socket } from "../../socket.js"; // Import from your socket.js

// export function useGameSocket(roomId, setRoomId) {
//   const [connected, setConnected] = useState(socket.connected);

//   useEffect(() => {
//     if (!roomId) return;

//     // Use the auth token already configured in socket.js
//     if (!socket.connected) {
//       socket.connect();
//     }

//     const onConnect = () => {
//       console.log("✅ Game Connected via Socket.io");
//       setConnected(true);
//       // Join the specific room identified in the URL
//       socket.emit("join_room", { roomId });
//     };

//     const onDisconnect = () => {
//       console.log("❌ Game Disconnected");
//       setConnected(false);
//     };

//     socket.on("connect", onConnect);
//     socket.on("disconnect", onDisconnect);

//     // If already connected when the component mounts
//     if (socket.connected) onConnect();

//     return () => {
//       socket.off("connect", onConnect);
//       socket.off("disconnect", onDisconnect);
//     };
//   }, [roomId]);

//   const leaveRoom = () => {
//     socket.emit("leave_room", { roomId });
//     socket.disconnect();
//     setRoomId(null);
//   };

//   // Keep wsRef as an object with a 'current' property to avoid breaking Game.jsx
//   const wsRef = { current: socket };

//   return { wsRef, connected, leaveRoom };
// }
// ============================================
// SOLUTION: Use BOTH Socket.IO and WebSocket
// ============================================

// 1. Keep socket.js for CHAT (Socket.IO) - DON'T CHANGE THIS
// frontend/src/socket.js stays as is for chat

// 2. NEW: useGameSocket.js for GAME (Native WebSocket)
// Replace your frontend/src/hooks/game/useGameSocket.js with this:

import { useEffect, useRef, useState } from "react";
export function useGameSocket(roomId, setRoomId) {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!roomId) return; // ne pas se connecter si pas de room
    // In react there is a strict mode which unmount and mount
    // components to ensure that side effects are well used
    // so during this re-render we want want to create only once
    // our connection and persist it avoiding creating new one
    // on each re-render
    if (wsRef.current) return; // éviter double connexion en strict mode

    const connectWS = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("❌ No token found for game connection");
          return;
        }

        // ✅ Native WebSocket for GAME (not Socket.IO)
        // const wsUrl = `wss://localhost:8443/game?token=${encodeURIComponent(token)}&roomId=${encodeURIComponent(roomId)}`;

        // Get the current page protocol and host to
        // construct the WebSocket URL dynamically.
        // This ensures it works in both development
        // and production environments without hardcoding
        // the backend URL.
        // Here it means if the page is served over HTTPS,
        // we use wss, otherwise ws. The host is the same as the
        // page host, and we keep the /game path and query params.
        // Browsers block mixed content, so if the page is HTTPS,
        // the WebSocket must also be secure (wss).
        const protocol = window.location.protocol === "https:" ? "wss" : "ws";
        // The host includes hostname and port (e.g., localhost:3000 or myapp.com)
        // it connects the WS to the same server that served the frontend.
        const host = window.location.host; // includes hostname and port
        // Connexion WebSocket vers la room spécifique
        // const WS_URL = `${protocol}://${host}/game?token=${encodeURIComponent(token)}&roomId=${encodeURIComponent(roomId)}`;
        const WS_URL = `${protocol}://${host}/ws/game?token=${encodeURIComponent(token)}&roomId=${encodeURIComponent(roomId)}`;
        console.log(`🎮 Connecting to game WebSocket: ${roomId}`);
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          console.log(`WS connected to room ${roomId}`);
          setConnected(true);
        };
        // ws.onmessage = (e) => {
        //   console.log(e.data);
        // };
        ws.onclose = () => {
          console.log("WS closed");
          setConnected(false);
          wsRef.current = null;
        };
        ws.onerror = (err) => console.error("WS error:", err);

        wsRef.current = ws;
      } catch (err) {
        console.error("Failed to connect WS:", err);
      }
    };

    connectWS();

    return () => {
      console.log("Clean up -> closing WS");
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)
        wsRef.current.close();
    };
  }, [roomId]);

  // Function to call when the client want to leave room
  const leaveRoom = () => {
    if (wsRef.current) wsRef.current.close();
    // And remove the roomId store from the local storage
    sessionStorage.removeItem("roomId");
    setRoomId(null);
  };

  return { wsRef, connected, leaveRoom };
}

// export function useGameSocket(roomId, setRoomId) {
//   const wsRef = useRef(null);
//   const [connected, setConnected] = useState(false);
//   const reconnectTimeoutRef = useRef(null);
//   const reconnectAttemptsRef = useRef(0);
//   const maxReconnectAttempts = 5;
//   const isMountedRef = useRef(true);

//   useEffect(() => {
//     if (!roomId) return;
//     if (wsRef.current) return;

//     const connectWebSocket = () => {
//       const token = localStorage.getItem("token");

//       if (!token) {
//         console.error("❌ No token found for game connection");
//         return;
//       }

//       // ✅ Native WebSocket for GAME (not Socket.IO)
//       const wsUrl = `wss://localhost:8443/game?token=${encodeURIComponent(token)}&roomId=${encodeURIComponent(roomId)}`;

//       console.log(`🎮 Connecting to game WebSocket: ${roomId}`);

//       try {
//         const ws = new WebSocket(wsUrl);
//         wsRef.current = ws;

//         ws.onopen = () => {
//           console.log("✅ Game WebSocket connected!");
//           setConnected(true);
//           reconnectAttemptsRef.current = 0;
//         };

//         ws.onmessage = (event) => {
//           try {
//             const message = JSON.parse(event.data);
//             if (
//               message.type === "ASSIGN_ROLE" ||
//               message.type === "ASSIGN_ID"
//             ) {
//               console.log("📨 Game message:", message);
//             }
//           } catch (error) {
//             console.error("Failed to parse game message:", error);
//           }
//         };

//         ws.onerror = (error) => {
//           console.error("❌ Game WebSocket error:", error);
//         };

//         ws.onclose = (event) => {
//           console.log(
//             `❌ Game WebSocket closed (code: ${event.code}, reason: ${event.reason})`,
//           );
//           setConnected(false);
//           wsRef.current = null;

//           // Auto-reconnect
//           if (reconnectAttemptsRef.current < maxReconnectAttempts) {
//             reconnectAttemptsRef.current++;
//             const delay = Math.min(
//               1000 * Math.pow(2, reconnectAttemptsRef.current),
//               10000,
//             );
//             console.log(
//               `🔄 Reconnecting game in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`,
//             );

//             reconnectTimeoutRef.current = setTimeout(() => {
//               connectWebSocket();
//             }, delay);
//           } else {
//             console.error("❌ Max game reconnection attempts reached");
//           }
//         };
//       } catch (error) {
//         console.error("❌ Failed to create game WebSocket:", error);
//       }
//     };

//     connectWebSocket();

//     return () => {
//       if (reconnectTimeoutRef.current) {
//         clearTimeout(reconnectTimeoutRef.current);
//       }
//       if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//         wsRef.current.close();
//       }
//     };
//   }, [roomId]);

//   const leaveRoom = () => {
//     if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//       wsRef.current.close();
//     }
//     setConnected(false);
//     setRoomId(null);
//     sessionStorage.removeItem("roomId");
//   };

//   return { wsRef, connected, leaveRoom };
// }

// 3. Your chat continues to use socket.js (Socket.IO)
// ChatPage.jsx would use: import { socket } from "./socket.js";
// GamePage.jsx would use: import { useGameSocket } from "./hooks/game/useGameSocket";

// Summary:
// - Chat: Socket.IO on wss://localhost:8443/socket.io
// - Game: Native WebSocket on wss://localhost:8443/game
// - Both proxied through nginx to backend:8281
