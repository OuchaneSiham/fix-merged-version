import { useEffect } from "react";
import { ClientMessageType } from "../../messages/messages.js";

export default function usePlayerInputs(wsRef) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      
      const socket = wsRef.current;
      // Check if socket exists and is connected
      if (!socket || !socket.connected) return;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        console.log("UP KEY PRESSED");
        
        // Use .emit instead of .send, and send the object directly
        socket.emit("message", {
          type: ClientMessageType.PLAYER_INPUT,
          action: "MOVE_UP",
        });
      }

      if (e.key === "ArrowDown") {
        console.log("DOWN KEY PRESSED");
        
        socket.emit("message", {
          type: ClientMessageType.PLAYER_INPUT,
          action: "MOVE_DOWN",
        });
      }
    };

    const handleKeyUp = (e) => {
      const socket = wsRef.current;
      if (!socket || !socket.connected) return;

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        // Use .emit instead of .send
        socket.emit("message", {
          type: ClientMessageType.PLAYER_INPUT_STOP,
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [wsRef]);
}