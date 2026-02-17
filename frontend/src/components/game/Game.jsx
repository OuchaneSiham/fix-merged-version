import { useEffect, useRef } from "react";
import usePlayerInputs from "../../hooks/game/usePlayerInputs.js";
import wallSoundFile from "../../Assets/sounds/wall.mp3";
import paddleSoundFile from "../../Assets/sounds/paddle.mp3";

export default function Game({ gameState, wsRef }) {
  const canvasRef = useRef(null);
  const wallSound = useRef(null);
  const paddleSound = useRef(null);
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
  useEffect(() => {
    wallSound.current = new Audio(wallSoundFile);
    paddleSound.current = new Audio(paddleSoundFile);
    // auto means that the browser will 
    // download the audio file immediately 
    // when the page loads
    wallSound.current.preload = "auto";
    paddleSound.current.preload = "auto";

    // load() forces the browser to load the audio 
    // file immediately, which can help reduce latency 
    // when the sound is played for the first time
    wallSound.current.load();
    paddleSound.current.load();
  }, []); // [] ensures that the sounds are loaded only once when the component mounts 

  // This to detect new events and play the corresponding 
  // sound effects without replaying sounds for old events
  // if not used; the sounds would play every time the game 
  // state updates, which would be incorrect and annoying
  const lastEventsRef = useRef([]);

  useEffect(() => {
    if (!gameState) return;

    // Filter out new events that have occurred since 
    // the last update by comparing the current events 
    // with the last events stored in the ref. This ensures 
    // that only new events trigger sound effects, preventing 
    // sounds from playing multiple times for the same event.
    const newEvents = gameState.events?.filter(
      (e) => !lastEventsRef.current.includes(e),
    );

    if (!newEvents?.length) return;
    newEvents.forEach((e) => {
      if (gameState.status !== "RUNNING") return;

      if (e.type === "BALL_HIT_WALL") {
        // Reset the current time of the wall sound 
        // to 0 before playing it to ensure that the 
        // sound plays from the beginning every time it's 
        // triggered, even if the sound is already playing
        wallSound.current.currentTime = 0;
        wallSound.current.play();
      }

      if (e.type === "BALL_HIT_PADDLE") {
        paddleSound.current.currentTime = 0;
        paddleSound.current.play();
      }
    });

    // Update the last events ref to the current 
    // events so that in the next update, we can 
    // correctly identify new events
    lastEventsRef.current = gameState.events || [];
  }, [gameState.events]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="
    block mx-auto
    bg-black
    rounded-xl
    border border-slate-700
    shadow-2xl shadow-cyan-500/10
    w-[90vw]
    max-w-[800px]
    aspect-[4/3]
  "
    />
  );
}
