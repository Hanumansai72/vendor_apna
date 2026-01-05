// socket.js
import { io } from "socket.io-client";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://backend-d6mx.vercel.app"
    : "http://localhost:8031";

// Get auth token from cookies or localStorage
const getAuthToken = () => {
  // Try to get from localStorage first
  const storedToken = localStorage.getItem('authToken');
  if (storedToken) return storedToken;

  // Try to get from cookies
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'token') return value;
  }
  return null;
};

export const socket = io(API_BASE, {
  transports: ["websocket", "polling"],
  withCredentials: true,
  auth: {
    token: getAuthToken()
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000
});

// Handle connection events
socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('connect_error', (error) => {
  console.log('Socket connection error:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

// Update auth token when it changes (e.g., after login)
export const updateSocketAuth = (token) => {
  socket.auth = { token };
  if (socket.connected) {
    socket.disconnect();
    socket.connect();
  }
};
