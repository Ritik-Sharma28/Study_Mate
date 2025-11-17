import { io } from 'socket.io-client';

let socket;

// We connect to the backend URL
// (This works because of your vite.config.js proxy)
const URL = import.meta.env.VITE_API_BASE_URL === '/api' 
  ? undefined 
  : import.meta.env.VITE_API_BASE_URL;
// --- END FIX ---

export const connectSocket = () => {
  if (!socket) {
    socket = io(URL, {
      withCredentials: true, // This is essential for sending cookies
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

// --- Emitters (Sending data to server) ---

export const joinRoom = (roomId) => {
  if (socket) socket.emit('joinRoom', roomId);
};

export const leaveRoom = (roomId) => {
  if (socket) socket.emit('leaveRoom', roomId);
};

export const sendMessage = (roomId, message) => {
  if (socket) socket.emit('sendMessage', { roomId, message });
};

// --- Listeners (Receiving data from server) ---

export const onMessageReceived = (callback) => {
  if (socket) {
    socket.on('receiveMessage', (messageData) => {
      callback(messageData);
    });
  }
};

export const offMessageReceived = () => {
  if (socket) socket.off('receiveMessage');
};