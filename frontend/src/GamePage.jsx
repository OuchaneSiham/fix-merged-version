import { useState } from "react";
// import "./App.css";
import Game from "./components/game/Game";
import { GameOver } from "./components/game/GameOver";
import { GameWaiting } from "./components/game/GameWaiting";
import PlayerWaiting from "./components/game/PlayerWaiting";
import RoomPage from "./components/game/RoomPage";
import GamePaused from "./components/game/GamePaused";
import GameSpectator from "./components/game/GameSpectator";
import useGameState from "./hooks/game/useGameState";
import { useGameSocket } from "./hooks/game/useGameSocket";
// Beta#alpha#1337
function GamePage() {
  const [roomId, setRoomId] = useState(() => {
    return sessionStorage.getItem("roomId") || null;
  });

  const handleSelectRoom = (id) => {
    if (id) {
      setRoomId(id);
      sessionStorage.setItem("roomId", id);
    }
  };

  const { wsRef, connected, leaveRoom } = useGameSocket(roomId, setRoomId);
  const { gameState, sendReady, pauseGame, resumeGame } = useGameState(
    wsRef,
    connected,
  );

  //   console.log("Current roomId:", roomId);
  //   console.log("Game state:", gameState);
  if (!roomId) {
    console.log("No room selected, showing RoomPage");
    return <RoomPage onSelectRoom={handleSelectRoom} />;
  }

  if (!connected) {
    return <div>Connecting to room {roomId}...</div>;
  }

  if (!gameState) {
    return <div>Loading Game State...</div>;
  }

  if (gameState.status === "RUNNING") {
    if (gameState.you === "SPECTATOR") {
      return (
        <GameSpectator
          gameState={gameState}
          wsRef={wsRef}
          leaveRoom={leaveRoom}
        />
      );
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <h1 className="mb-6 text-5xl font-extrabold tracking-widest uppercase">
          Pong
        </h1>
        <div className="flex flex-row justify-center gap-4 mb-4">
          <button
            onClick={leaveRoom}
            className="mb-4 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold"
          >
            Quit Room
          </button>
          <button
            onClick={pauseGame}
            className="mb-4 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold"
          >
            Pause Game
          </button>
        </div>
        <Game gameState={gameState} wsRef={wsRef} />
      </div>
    );
  }

  if (gameState.you === "SPECTATOR") {
    if (
      gameState.status === "WAITING" ||
      gameState.status === "WAITING_OPPONENT"
    ) {
      return (
        <GameWaiting
          sendReady={sendReady}
          spectator={true}
          leaveRoom={leaveRoom}
        />
      );
    }
    if (gameState.status === "PAUSED") {
      return (
        <GamePaused
          text="Game paused"
          gamePaused={gameState.gamePaused}
          pausedByPlayerId={gameState.pausedByPlayerId}
          me={gameState.you}
          resumeGame={resumeGame}
          isPlayer={false}
        />
      );
    }
    if (gameState.status === "FINISHED") {
      return <GameOver gameState={gameState} />;
    }
    return <div>Unknown game state for spectator</div>;
  }

  const me = gameState[gameState.you];
  if (!me && gameState.you !== "SPECTATOR") {
    return <div className="text-white">Initializing your paddle...</div>;
  }
  const opponent =
    gameState.you === "player1" ? gameState.player2 : gameState.player1;
  const opponentReady = opponent?.ready || gameState.aiEnabled;

  if (!me.ready) {
    return (
      <GameWaiting
        sendReady={sendReady}
        spectator={false}
        leaveRoom={leaveRoom}
      />
    );
  }

  if (me.ready && !opponentReady && gameState.status === "WAITING_OPPONENT") {
    return <PlayerWaiting />;
  }

  if (gameState.status === "PAUSED") {
    return (
      <GamePaused
        text={gameState.gamePaused ? "Game Paused" : "Player disconnected"}
        gamePaused={gameState.gamePaused}
        pausedByPlayerId={gameState.pausedByPlayerId}
        me={gameState.you}
        resumeGame={resumeGame}
        isPlayer={true}
      />
    );
  }

  if (gameState.status === "FINISHED") {
    return <GameOver gameState={gameState} />;
  }

  return (
    <div>
      Unknown game state <br />
      Status: {gameState.status} <br />
      You: {gameState.you}
    </div>
  );
}

export default GamePage;
