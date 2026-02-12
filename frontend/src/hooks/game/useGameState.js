// import { useEffect, useState } from "react";
// import { ClientMessageType, ServerMessageType } from "../../messages/messages.js";

// export default function useGameState(wsRef, connected) {
//   const [gameState, setGameState] = useState(null);

// // Inside useGameState.js
// useEffect(() => {
//   if (!connected) return;
//   const ws = wsRef.current;

//   // Socket.io uses .on() instead of addEventListener
//   const handleMessage = (data) => {
//     // Check if the server message type matches GAME_SNAPSHOT
//     if (data.type === ServerMessageType.GAME_SNAPSHOT) {
//       setGameState(data.snapshot);
//     }
//   };

//   ws.on("message", handleMessage); // Use .on for Socket.io
//   return () => ws.off("message", handleMessage);
// }, [connected]);

//   function sendReady() {
//     const ws = wsRef.current;
//     if (!ws || ws.readyState !== WebSocket.OPEN) return;
//     ws.send(JSON.stringify({ type: ClientMessageType.PLAYER_READY }));
//   }
//    // Auto-ready when connected → starts game vs AI if no opponent
//   useEffect(() => {
//     if (connected && wsRef.current?.readyState === WebSocket.OPEN) {
//       console.log("Auto-sending PLAYER_READY → game should start");
//       wsRef.current.send(JSON.stringify({ type: ClientMessageType.PLAYER_READY }));
//     }
//   }, [connected]);
//   return { gameState, sendReady };

// }
import { useEffect, useState } from "react";
import { ClientMessageType } from "../../messages/messages.js";

export default function useGameState(wsRef, connected) {
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    if (!connected || !wsRef.current) return;

    const ws = wsRef.current;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle different message types from GameGateway
        switch (data.type) {
          case "GAME_SNAPSHOT":
            setGameState(data.snapshot);
            break;
          
          case "ASSIGN_ROLE":
            console.log("✅ Assigned role:", data.role);
            break;
          
          case "ASSIGN_ID":
            console.log("✅ Assigned player ID:", data.playerId);
            break;
          
          case "AUTHENTIFICATION":
            console.error("❌ Auth error:", data.message);
            break;
          
          default:
            console.log("❓ Unknown message type:", data.type);
        }
      } catch (error) {
        console.error("Failed to parse game message:", error);
      }
    };

    // Attach message listener
    ws.addEventListener("message", handleMessage);

    // Cleanup
    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [connected]);

  const sendReady = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: ClientMessageType.PLAYER_READY,
        })
      );
      console.log("📤 Sent PLAYER_READY");
    } else {
      console.error("❌ Cannot send PLAYER_READY: WebSocket not connected");
    }
  };

  return { gameState, sendReady };
}