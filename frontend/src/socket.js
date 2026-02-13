import { io } from "socket.io-client";

export const socket = io("https://localhost:8443", {
  path: "/socket.io",
  transports: ["polling"],
  upgrade: false,
  autoConnect: false,
  secure: true,
  auth: {
    token: localStorage.getItem("token") 
  }
});