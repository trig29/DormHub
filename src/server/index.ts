import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getVideoList, convertToHLS, getHLSPlaylist } from './videoService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Serve HLS files
app.use('/hls', express.static(path.join(__dirname, '../../hls')));

// API Routes (must be before static file serving)
app.get('/api/videos', async (req, res) => {
  try {
    const videos = await getVideoList();
    res.json(videos);
  } catch (error) {
    console.error('Error fetching video list:', error);
    res.status(500).json({ error: 'Failed to fetch video list' });
  }
});

app.post('/api/videos/:filename/convert', async (req, res) => {
  try {
    const { filename } = req.params;
    await convertToHLS(filename);
    res.json({ message: 'Conversion started', filename });
  } catch (error) {
    console.error('Error converting video:', error);
    res.status(500).json({ error: 'Failed to convert video' });
  }
});

app.get('/api/videos/:filename/playlist', async (req, res) => {
  try {
    const { filename } = req.params;
    const playlistPath = await getHLSPlaylist(filename);
    if (playlistPath) {
      const outputName = path.basename(filename, path.extname(filename));
      res.json({ playlistUrl: `/hls/${outputName}/index.m3u8` });
    } else {
      res.status(404).json({ error: 'HLS playlist not found' });
    }
  } catch (error) {
    console.error('Error getting playlist:', error);
    res.status(500).json({ error: 'Failed to get playlist' });
  }
});

// Serve static files (production build only) - must be after API routes
const clientDistPath = path.join(__dirname, '../client');
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  app.use(express.static(clientDistPath));
  
  // Serve index.html for client routes (SPA) - must be last
  app.get('*', (req, res) => {
    // Only serve index.html for non-API and non-HLS routes
    if (!req.path.startsWith('/api') && !req.path.startsWith('/hls')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Access locally at http://localhost:${PORT}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`PORT from env: ${process.env.PORT || 'not set'}`);
});

