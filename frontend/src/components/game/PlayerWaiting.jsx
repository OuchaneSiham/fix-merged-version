export default function PlayerWaiting() {
  return (
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
        className="bg-neutral-900 border border-neutral-700
                      rounded-2xl p-8 shadow-2xl
                      flex flex-col items-center gap-6"
      >
        <svg
          className="h-10 w-10 text-cyan-400 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-20"
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
        <p className="text-xl font-semibold tracking-wide text-cyan-400 animate-pulse">
          Waiting for opponent…
        </p>

        <p className="text-sm text-neutral-400 text-center">
          You are ready. The game will start as soon as the second player joins.
        </p>
      </div>
    </div>
  );
}
