import { useEffect, useState } from "react";
import { ClientMessageType, ServerMessageType } from "../../messages/messages.js";

export default function useGameState(wsRef, connected) {
  const [gameState, setGameState] = useState(null);

// Inside useGameState.js
useEffect(() => {
  if (!connected) return;
  const ws = wsRef.current;

  // Socket.io uses .on() instead of addEventListener
  const handleMessage = (data) => {
    // Check if the server message type matches GAME_SNAPSHOT
    if (data.type === ServerMessageType.GAME_SNAPSHOT) {
      setGameState(data.snapshot);
    }
  };

  ws.on("message", handleMessage); // Use .on for Socket.io
  return () => ws.off("message", handleMessage);
}, [connected]);

  function sendReady() {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: ClientMessageType.PLAYER_READY }));
  }
   // Auto-ready when connected → starts game vs AI if no opponent
  useEffect(() => {
    if (connected && wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("Auto-sending PLAYER_READY → game should start");
      wsRef.current.send(JSON.stringify({ type: ClientMessageType.PLAYER_READY }));
    }
  }, [connected]);
  return { gameState, sendReady };

}
