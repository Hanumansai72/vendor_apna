// socket.js
import { io } from "socket.io-client";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://backend-d6mx.vercel.app" // your backend URL
    : "http://localhost:5000";

export const socket = io(API_BASE, {
  transports: ["websocket"], // enforce WebSocket transport only
  reconnectionAttempts: 3,   // stop infinite retry loops
  reconnectionDelay: 3000,
});
