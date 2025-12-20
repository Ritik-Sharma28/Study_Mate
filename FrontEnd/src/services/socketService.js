import { io } from 'socket.io-client';

let socket;

const URL ='https://studymate-node.onrender.com';
// const baseUrl = import.meta.env.VITE_API_BASE_URL;
// const URL = baseUrl ? baseUrl.replace('/api', '') : undefined;

export const connectSocket = () => {
  if (!socket) {
    socket = io(URL, {
      withCredentials: true,
      transports: ['websocket']
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