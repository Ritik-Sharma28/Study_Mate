import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import User from './models/User.model.js';
import Message from './models/Message.model.js';

export const initializeSocket = (io) => {
  
  
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) {
        return next(new Error('Authentication error: No cookies provided.'));
      }

      const cookies = parse(cookieHeader);
      const token = cookies.jwt; 
      if (!token) {
        return next(new Error('Authentication error: No token.'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('_id name avatarId _id');
      if (!user) {
        return next(new Error('Authentication error: User not found.'));
      }

      
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Token is invalid.'));
    }
  });

  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.id})`);

    
    
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`${socket.user.name} joined room: ${roomId}`);
    });

    
    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
      console.log(`${socket.user.name} left room: ${roomId}`);
    });

    
    socket.on('sendMessage', async (data) => {
      try {
        const { roomId, message, isGroup } = data;
        
        
        const dbMessage = await Message.create({
          sender: socket.user._id,
          content: message,
          [isGroup ? 'group' : 'dmRoom']: roomId, 
        });

        
        const messageData = await dbMessage.populate('sender', 'name avatarId _id');

        
        socket.to(roomId).emit('receiveMessage', messageData);

      } catch (error) {
        console.error('Socket sendMessage error:', error);
      }
    });

    
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.id})`);
    });
  });
};