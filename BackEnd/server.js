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
// NOTE: http-proxy-middleware is no longer needed/imported

// --- 1. IMPORT ALL YOUR ROUTE FILES ---
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';
import userRoutes from './routes/user.routes.js';
import messageRoutes from './routes/message.routes.js';
import groupRoutes from './routes/group.routes.js';
import matchRoutes from './routes/match.routes.js'; // NEW: Match routes
import { checkAndSeedGroups } from './seeder.js';

// --- Initial Setup ---
dotenv.config();

// Define environment variables for production (Uses the previous CORS fix)
// This will be 'http://localhost:5173' when running locally with 'npm run dev'
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173';

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
    origin: FRONTEND_ORIGIN,
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
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Static Folder ---
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// --- 2. USE ALL YOUR API ROUTES ---
app.get('/api', (req, res) => {
  res.send('API is running successfully.');
});

// NEW: Use the match routes under the old /api/v1 prefix
// This replaces the proxy and serves the logic directly from Node.js
app.use('/api/v1', matchRoutes); 

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes); 

// --- Start Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);