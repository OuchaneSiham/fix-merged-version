// import { useEffect } from "react";
// import { ClientMessageType } from "../../messages/messages.js";

// export default function usePlayerInputs(wsRef) {
//   useEffect(() => {
//     const handleKeyDown = (e) => {
//       if (e.repeat) return;
      
//       const socket = wsRef.current;
//       // Check if socket exists and is connected
//       if (!socket || !socket.connected) return;

//       if (e.key === "ArrowUp") {
//         e.preventDefault();
//         console.log("UP KEY PRESSED");
        
//         // Use .emit instead of .send, and send the object directly
//         socket.emit("message", {
//           type: ClientMessageType.PLAYER_INPUT,
//           action: "MOVE_UP",
//         });
//       }

//       if (e.key === "ArrowDown") {
//         console.log("DOWN KEY PRESSED");
        
//         socket.emit("message", {
//           type: ClientMessageType.PLAYER_INPUT,
//           action: "MOVE_DOWN",
//         });
//       }
//     };

//     const handleKeyUp = (e) => {
//       const socket = wsRef.current;
//       if (!socket || !socket.connected) return;

//       if (e.key === "ArrowUp" || e.key === "ArrowDown") {
//         // Use .emit instead of .send
//         socket.emit("message", {
//           type: ClientMessageType.PLAYER_INPUT_STOP,
//         });
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     window.addEventListener("keyup", handleKeyUp);

//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//       window.removeEventListener("keyup", handleKeyUp);
//     };
//   }, [wsRef]);
// }
import { useEffect } from "react";
import { ClientMessageType } from "../../messages/messages.js";

export default function usePlayerInputs(wsRef) {
  // const { wsRef } = useGameSocket(); // This will create another
  // ws instance thus this socket may differ to the one used
  // by other component result inputs are sended to a different ws

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return; // Ignore when the player holds the key avoiding
      // spamming the server and latency bugs
      //   console.log(e.key);
      //   console.log("Socket state: ", ws.readyState);
      // Check the ws state in each handler not once at beginning of the useffect
      // because it can change
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        console.log("UP KEY PRESSED");
        ws.send(
          JSON.stringify({
            type: ClientMessageType.PLAYER_INPUT,
            action: "MOVE_UP",
          }),
        );
      }
      if (e.key === "ArrowDown") {
        console.log("DOWN KEY PRESSED");
        ws.send(
          JSON.stringify({
            type: ClientMessageType.PLAYER_INPUT,
            action: "MOVE_DOWN",
          }),
        );
      }
    };
    const handleKeyUp = (e) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        ws.send(
          JSON.stringify({
            type: ClientMessageType.PLAYER_INPUT_STOP,
          }),
        );
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
