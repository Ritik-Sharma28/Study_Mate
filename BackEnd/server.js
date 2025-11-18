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
import { createProxyMiddleware } from 'http-proxy-middleware';

// --- 1. IMPORT ALL YOUR ROUTE FILES ---
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';
import userRoutes from './routes/user.routes.js';
import messageRoutes from './routes/message.routes.js';
import groupRoutes from './routes/group.routes.js';
import { checkAndSeedGroups } from './seeder.js';

// --- Initial Setup ---
dotenv.config();
// 3. Connect to DB *then* start seeding
connectDB().then(() => {
  // 4. Run the seeder function *after* connecting to DB
  checkAndSeedGroups();
});
const app = express();
const server = http.createServer(app);

// --- Configure Socket.io ---
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true,
  },
});

initializeSocket(io); // Pass the 'io' instance to our handler

// --- Get __dirname in ES Module ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middlewares ---
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.PYTHON_SERVICE_URL) {
    app.use('/api/v1', createProxyMiddleware({
        target: process.env.PYTHON_SERVICE_URL, // We will set this Env Var in Render
        changeOrigin: true,
        pathRewrite: {
            '^/api/v1': '/api/v1', // Keep the path same
        },
    }));
}

// --- Static Folder ---
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// --- 2. USE ALL YOUR API ROUTES ---
app.get('/api', (req, res) => {
  res.send('API is running successfully.');
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes); // <-- This is the line that fixes the 404

// --- Start Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);