import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import http from 'http';
import { Server } from 'socket.io';
import { initializeSocket } from './socketHandler.js';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';
import userRoutes from './routes/user.routes.js';
import messageRoutes from './routes/message.routes.js';
import groupRoutes from './routes/group.routes.js';
import matchRoutes from './routes/match.routes.js';
import commentRoutes from './routes/comment.routes.js';
import { checkAndSeedGroups } from './seeder.js';

dotenv.config();

const FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173';

connectDB().then(() => {
  checkAndSeedGroups();
});

const app = express();
const server = http.createServer(app);

app.set('trust proxy', 1);

const io = new Server(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    credentials: true,
  },
});

initializeSocket(io);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/api', (req, res) => {
  res.send('API is running successfully.');
});

app.use('/api/v1', matchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/comments', commentRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);