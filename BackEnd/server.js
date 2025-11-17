import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import http from 'http'; // 1. Import http
import { Server } from 'socket.io'; // 2. Import Socket.io Server
import { initializeSocket } from './socketHandler.js'; // 3. Import our new socket logic
import messageRoutes from './routes/message.routes.js';

// --- Initial Setup ---
dotenv.config();
connectDB();
const app = express();
const server = http.createServer(app); // 4. Create an http server

// 5. Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true, // This allows cookies
  },
});

initializeSocket(io); // 6. Pass the 'io' instance to our handler

// --- Get __dirname in ES Module ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middlewares ---
app.use(
  cors({
    origin: 'http://localhost:5173', // Allow frontend to make requests
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Static Folder ---
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// --- API Routes ---
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';
import userRoutes from './routes/user.routes.js';

app.get('/api', (req, res) => {
  res.send('API is running successfully.');
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// --- Start Server ---
const PORT = process.env.PORT || 5000;
// 7. Use server.listen instead of app.listen
server.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);