import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';

import connectDB from './config/db.js';
import { initializeSocket } from './socketHandler.js';


import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';
import userRoutes from './routes/user.routes.js';
import messageRoutes from './routes/message.routes.js';
import groupRoutes from './routes/group.routes.js';
import matchRoutes from './routes/match.routes.js';
import commentRoutes from './routes/comment.routes.js';


dotenv.config();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'https://localhost:5173';
const __dirname = path.dirname(fileURLToPath(import.meta.url));


const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: FRONTEND_ORIGIN,
  credentials: true,
};

app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/api', (_, res) => res.send('API is running successfully.'));

app.use('/api/v1', matchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);


const startServer = async () => {
  try {
    await connectDB();

    const io = new Server(server, { cors: corsOptions });
    initializeSocket(io);

    server.listen(PORT, () =>
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
    );
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();