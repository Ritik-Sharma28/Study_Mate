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
import matchRoutes from './routes/match.routes.js'; // Ensure you have this if you migrated logic
import { checkAndSeedGroups } from './seeder.js';

dotenv.config();

// FIXED: Allow both Localhost AND your Render Frontend
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  process.env.FRONTEND_URL // You must set this in Render Environment Variables!
];

connectDB().then(() => {
  checkAndSeedGroups();
});

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
      // If the specific origin isn't found, check if it matches the deployed frontend domain generally
      if (process.env.FRONTEND_URL && origin.includes('onrender.com')) {
         return callback(null, true);
      }
      return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    }
    return callback(null, true);
  },
  credentials: true,
};

// --- Configure Socket.io ---
const io = new Server(server, {
  cors: corsOptions,
});

initializeSocket(io);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middlewares ---
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/api', (req, res) => {
  res.send('API is running successfully.');
});

// Use Routes
app.use('/api/v1', matchRoutes); // If you added the new match routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
