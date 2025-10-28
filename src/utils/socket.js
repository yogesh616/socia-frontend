import { io } from "socket.io-client";

export const SOCKET_URL =  "https://socia-chat-server.onrender.com" || "http://localhost:3000"; // Change to your production URL

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const initSocket = (token) => {
  // Return existing socket if already connected
  if (socket?.connected) {
    return socket;
  }

  // Disconnect old socket if exists
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    path: "/socket.io",
    auth: { token },
    transports: ["websocket", "polling"], // Fallback to polling
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  // Connection successful
  socket.on("connect", () => {
   // console.log("✅ Socket connected:", socket.id);
    reconnectAttempts = 0;
  });

  // Connection error
  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
    reconnectAttempts++;
    
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error("Max reconnection attempts reached. Please refresh.");
      socket.disconnect();
    }
  });

  // Disconnected
  socket.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", reason);
    
    // Auto-reconnect unless manually disconnected
    if (reason === "io server disconnect") {
      socket.connect();
    }
  });

  // Server errors
  socket.on("error", (error) => {
    console.error("⚠️ Socket error:", error);
  });

  // Reconnection attempt
  socket.on("reconnect_attempt", (attemptNumber) => {
    console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
  });

  // Reconnection success
  socket.on("reconnect", (attemptNumber) => {
    console.log(`✅ Reconnected after ${attemptNumber} attempts`);
    reconnectAttempts = 0;
  });

  // Reconnection failed
  socket.on("reconnect_failed", () => {
    console.error("❌ Reconnection failed. Please refresh the page.");
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    console.warn("⚠️ Socket not initialized. Call initSocket(token) first.");
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log("🔌 Manually disconnecting socket...");
    socket.disconnect();
    socket = null;
  }
};

// Helper to check if socket is connected
export const isSocketConnected = () => {
  return socket?.connected || false;
};

// Helper to emit with promise
export const emitWithAck = (event, data, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    if (!socket || !socket.connected) {
      return reject(new Error("Socket not connected"));
    }

    const timer = setTimeout(() => {
      reject(new Error("Socket timeout"));
    }, timeout);

    socket.emit(event, data, (response) => {
      clearTimeout(timer);
      resolve(response);
    });
  });
};
