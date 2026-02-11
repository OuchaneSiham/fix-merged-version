import { useEffect, useState } from "react";
import { socket } from "../../socket.js"; // Import from your socket.js

export function useGameSocket(roomId, setRoomId) {
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    if (!roomId) return;

    // Use the auth token already configured in socket.js
    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      console.log("✅ Game Connected via Socket.io");
      setConnected(true);
      // Join the specific room identified in the URL
      socket.emit("join_room", { roomId }); 
    };

    const onDisconnect = () => {
      console.log("❌ Game Disconnected");
      setConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // If already connected when the component mounts
    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [roomId]);

  const leaveRoom = () => {
    socket.emit("leave_room", { roomId });
    socket.disconnect();
    setRoomId(null);
  };

  // Keep wsRef as an object with a 'current' property to avoid breaking Game.jsx
  const wsRef = { current: socket };

  return { wsRef, connected, leaveRoom };
}