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
import { checkAndSeedGroups } from './seeder.js';

dotenv.config();

connectDB().then(() => {
  checkAndSeedGroups();
});

const app = express();
const server = http.createServer(app);

// --- DYNAMIC CORS ORIGIN SETUP ---
// This allows both Localhost AND your live Frontend
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL // You must set this in Render Dashboard!
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin); 
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Required for cookies
};

// --- Configure Socket.io with CORS ---
const io = new Server(server, {
  cors: corsOptions,
});

initializeSocket(io);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Apply CORS Middleware ---
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// --- Routes ---
app.get('/api', (req, res) => {
  res.send('API is running successfully.');
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
