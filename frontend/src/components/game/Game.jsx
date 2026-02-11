import { useEffect, useRef } from "react";
import usePlayerInputs from "../../hooks/game/usePlayerInputs.js";

export default function Game({ gameState, wsRef }) {
  const canvasRef = useRef(null);
  usePlayerInputs(wsRef);
  useEffect(() => {
    // Check is the gameState is null
    if (!gameState) return;
    // Get the canvas element stored in current
    const canvas = canvasRef.current;
    // Get the context where to draw and display
    const ctx = canvas.getContext("2d");

    // Clear the canvas on update
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the game field
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, gameState.field.width, gameState.field.height);

    // Draw the ball
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(
      gameState.ball.x,
      gameState.ball.y,
      gameState.ball.radius,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Draw Paddles
    ctx.fillRect(
      gameState.player1.x,
      gameState.player1.y,
      gameState.player1.width,
      gameState.player1.height,
    );
    ctx.fillRect(
      gameState.player2.x,
      gameState.player2.y,
      gameState.player2.width,
      gameState.player2.height,
    );

    // Display scores
    ctx.font = "30px Arial";
    ctx.fillText(`${gameState.player1.score}`, gameState.field.width / 4, 50);
    ctx.fillText(
      `${gameState.player2.score}`,
      (gameState.field.width / 4) * 3,
      50,
    );
    // Divide the game board in two parts
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.setLineDash([]);
  }, [gameState]);
  return (
    <canvas
      ref={canvasRef}
      width={gameState?.field.width || 800}
      height={gameState?.field.height || 600}
      className="
    block mx-auto
    bg-black
    rounded-xl
    border border-slate-700
    shadow-2xl shadow-cyan-500/10
  "
    />
  );
}
