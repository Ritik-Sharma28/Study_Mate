import { io } from 'socket.io-client';

let socket;

// Get the base URL from environment variable (e.g., https://studymate-node.onrender.com/api)
const BASE_URL_FROM_ENV = import.meta.env.VITE_API_BASE_URL;

// FIXED LOGIC: Determine the correct URL for the socket connection
// We strip the '/api' prefix because the Node.js Socket.io server listens at the root.
const SOCKET_URL = BASE_URL_FROM_ENV && BASE_URL_FROM_ENV.endsWith('/api') 
  ? BASE_URL_FROM_ENV.substring(0, BASE_URL_FROM_ENV.length - 4) 
  : BASE_URL_FROM_ENV; 

export const connectSocket = (userId) => {
  // Only connect if we have a valid URL and are not already connected
  // This resolves the 'Invalid namespace' error on deployment
  if (!socket && SOCKET_URL) { 
    socket = io(SOCKET_URL, { 
      withCredentials: true, 
      // Pass userId as a query parameter for potential backend auth checks
      query: {
        userId: userId
      }
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// --- Emitters ---

export const joinRoom = (roomId) => {
  if (socket) socket.emit('joinRoom', roomId);
};

export const leaveRoom = (roomId) => {
  if (socket) socket.emit('leaveRoom', roomId);
};

export const sendMessage = (roomId, message, isGroup = false) => {
  if (socket) {
    socket.emit('sendMessage', { roomId, message, isGroup });
  }
};

export const onMessageReceived = (callback) => {
  if (socket) {
    socket.removeAllListeners('receiveMessage'); 
    socket.on('receiveMessage', callback);
  }
};

export const offMessageReceived = () => {
  if (socket) {
    socket.removeAllListeners('receiveMessage');
  }
};
