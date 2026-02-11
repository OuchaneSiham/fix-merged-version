import { useEffect } from "react";

export default function RoomPage({ onSelectRoom }) {
  useEffect(() => {
    // Auto-join "default-room" as soon as you land on /game
    onSelectRoom("default-room");
  }, [onSelectRoom]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-7xl font-black tracking-widest mb-12 text-cyan-400">PONG</h1>
      <div className="text-2xl mb-8 animate-pulse">Connecting to game server...</div>
    </div>
  );
}