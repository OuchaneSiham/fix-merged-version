import { useState } from "react";

export default function RoomPage({ onSelectRoom }) {
  const [input, setInput] = useState("");
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
      {/* Titre fantaisie */}
      <h1 className="relative mb-14 text-7xl font-extrabold tracking-widest uppercase">
        <span
          className="absolute -inset-3 -skew-y-3
                     bg-gradient-to-r from-cyan-400 to-blue-600
                     rounded-lg blur-sm opacity-80"
        ></span>

        <span className="absolute inset-0 text-cyan-400 blur-xl opacity-40 select-none">
          PONG
        </span>

        <span className="relative z-10">PONG</span>
      </h1>

      <div className="flex flex-col items-center justify-center min-h-screen">
        <button
          className="text-white my-10 h-20 w-75 px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 transition-colors duration-300 font-bold"
          onClick={() => onSelectRoom(`ai-${Date.now()}`)}
        >
          Play vs AI
        </button>
        {/* <h2 className="mb-4 text-2xl font-bold">Enter Room ID</h2> */}
        <h2 className="mb-4 text-2xl font-bold">Enter Room ID</h2>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="mb-4 px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 w-64"
        //   className="border p-2 mb-4"
          placeholder="Room ID"
          required
        />
        <button
          className="text-white h-12 w-32 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-colors duration-300 font-bold"

        //   className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => onSelectRoom(input)}
        >
          Join Room
        </button>
      </div>
    </div>
  );
}
