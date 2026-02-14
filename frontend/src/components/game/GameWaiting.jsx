import { GameOver } from "./GameOver";

export function GameWaiting({ sendReady, spectator, leaveRoom }) {
  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
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
        <div
          className="w-full max-w-md bg-dark border border-neutral-700
                      rounded-2xl p-8 shadow-2xl
                      flex flex-col items-center gap-6"
        >
          <div className="flex flex-col items-center gap-4 text-white text-xl font-semibold tracking-wide">
            <svg
              className="h-6 w-6 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>

            <span className="animate-pulse text-white">
              WAITING FOR PLAYERS…
            </span>
          </div>
          {!spectator && (
            <button
              onClick={sendReady}
              className="
        text-white my-2 h-15 w-75 px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 transition-colors duration-300 font-bold
      "
            >
              READY
            </button>
          )}
          <button
            className="text-white my-2 h-15 w-75 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-colors duration-300 font-bold"
            onClick={leaveRoom}
          >
            Quit Room
          </button>
        </div>
      </div>
    </>
  );
}
