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
          className="w-full max-w-md rounded-2xl
                  bg-neutral-900
                  p-8 shadow-2xl
                  border border-neutral-700
                  flex flex-col items-center gap-8"
        >
          <div
            className="flex items-center gap-3
                    text-xl font-semibold tracking-wide
                    text-cyan-400
                    animate-pulse"
          >
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

            <span className="animate-[wiggle_0.4s_ease-in-out_infinite]">
              Waiting for players…
            </span>
          </div>
          {!spectator && (
            <button
              onClick={sendReady}
              className="
        w-full py-3 rounded-xl
        bg-white text-black
        hover:bg-gray-200
        active:scale-95
        transition-all duration-150
        font-bold text-lg tracking-wider uppercase
        shadow-lg
      "
            >
              Ready
            </button>
          )}
          <button
            className="mb-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
            onClick={leaveRoom}
          >
            Quit Room
          </button>
        </div>
      </div>
    </>
  );
}
