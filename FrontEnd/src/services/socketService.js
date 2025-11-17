import { io } from 'socket.io-client';

let socket;

// We connect to the backend URL
// (This works because of your vite.config.js proxy)
const URL = import.meta.env.VITE_API_BASE_URL === '/api' 
  ? undefined 
  : import.meta.env.VITE_API_BASE_URL;

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

// --- THIS IS THE FIX ---
// 1. Accept 'isGroup' (which you were already passing from DmScreen)
export const sendMessage = (roomId, message, isGroup) => {
  if (socket) {
    // 2. Pass 'isGroup' to the server in the data object
    socket.emit('sendMessage', { roomId, message, isGroup });
  }
};
// --- END FIX ---

export const onMessageReceived = (callback) => {
  if (socket) {
    // 1. Remove any old listeners to prevent duplicates
    socket.removeAllListeners('receiveMessage'); 
    // 2. Add the new, fresh listener
    socket.on('receiveMessage', callback);
  }
};

export const offMessageReceived = () => {
  if (socket) {
    // 3. Remove all listeners for this event when a chat closes
    socket.removeAllListeners('receiveMessage');
  }
};