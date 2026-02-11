import Game from "./Game";

export default function GameSpectator({ gameState, wsRef, leaveRoom }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
      <h1 className="text-5xl font-extrabold mb-6">PONG</h1>
      <p className="text-xl text-gray-300 mb-4">
        You are watching the game as a spectator
      </p>
       <button
          className="mb-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          onClick={leaveRoom}
        >
          Quit Room
        </button>
      <Game gameState={gameState} wsRef={wsRef} />
    </div>
  );
}
