import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import User from './models/User.model.js';
import Message from './models/Message.model.js';

export const initializeSocket = (io) => {
  // --- Socket.io Middleware for Authentication ---
  // This runs BEFORE a user connects
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) {
        return next(new Error('Authentication error: No cookies provided.'));
      }

      const cookies = parse(cookieHeader);
      const token = cookies.jwt; // Get the 'jwt' cookie
      if (!token) {
        return next(new Error('Authentication error: No token.'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id name avatarId _id');
      if (!user) {
        return next(new Error('Authentication error: User not found.'));
      }

      // --- Attach user to the socket object ---
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Token is invalid.'));
    }
  });

  // --- Main Connection Handler ---
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.id})`);

    // --- Join Room ---
    // This handles both Group and DM rooms
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`${socket.user.name} joined room: ${roomId}`);
    });

    // --- Leave Room ---
    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
      console.log(`${socket.user.name} left room: ${roomId}`);
    });

    // --- 2. UPDATE sendMessage TO SAVE TO DB ---
    socket.on('sendMessage', async (data) => {
      try {
        const { roomId, message, isGroup } = data;
        
        // 1. Create message object for saving
        const dbMessage = await Message.create({
          sender: socket.user._id,
          content: message,
          [isGroup ? 'group' : 'dmRoom']: roomId, // Dynamic key
        });

        // 2. Populate the sender info for sending to clients
        const messageData = await dbMessage.populate('sender', 'name avatarId _id');

        // 3. Emit to everyone in the room *except* the sender
        socket.to(roomId).emit('receiveMessage', messageData);

      } catch (error) {
        console.error('Socket sendMessage error:', error);
      }
    });

    // --- Disconnect ---
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.id})`);
    });
  });
};