
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
  const leaveRoom = () => {
    if (wsRef.current) wsRef.current.close();
    sessionStorage.removeItem("roomId");
    setRoomId(null);
  };

  return { wsRef, connected, leaveRoom };
}
