import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory with cache settings
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d',
  index: false
}));

// API Healthcheck endpoint for cloud platforms & container monitors
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Employee Leave Management System (ELMS)',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Single Page Application (SPA) fallback to index.html for all web routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[ELMS] Production server running on http://0.0.0.0:${PORT}`);
});
