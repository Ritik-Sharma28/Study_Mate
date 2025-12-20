import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 1. PROXY: Forward all /api requests to your separate Backend Service
// Replace 'https://your-backend.onrender.com' with your actual Backend URL
app.use(
  '/api',
  createProxyMiddleware({
    target: process.env.BACKEND_URL || 'http://localhost:5000',
    changeOrigin: true,
    cookieDomainRewrite: "", // Important: Ensures cookies work on this domain
  })
);

// 2. STATIC FILES: Serve the React app
// Note: You must run 'npm run build' before starting this server
app.use(express.static(path.join(__dirname, 'dist')));

// 3. FALLBACK: Send index.html for any other route (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend Proxy Server running on port ${PORT}`);
});