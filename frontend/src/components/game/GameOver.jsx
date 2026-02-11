export function GameOver({ gameState }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <h1 className="text-5xl font-extrabold tracking-widest uppercase mb-6">
        Game Over
      </h1>

      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center space-y-4">
        <p className="text-lg text-slate-300">
          Status: <span className="font-semibold">{gameState.status}</span>
        </p>

        <p className="text-2xl font-bold">
          Winner:{" "}
          <span className="text-cyan-400">
            {gameState.winnerId === "player1"
              ? "player1"
              : gameState.winnerId === "player2"
                ? "player2"
                : "_"}
          </span>
        </p>

        <div className="flex justify-between text-slate-300 text-lg">
          <span>Player 1: {gameState.player1.score}</span>
          <span>Player 2: {gameState.player2.score}</span>
        </div>
      </div>
    </div>
  );
}
