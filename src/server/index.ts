import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { getVideoList, getHLSPlaylist, convertHLSToMP4, cleanupTempFiles } from './videoService.js';

// Load environment variables from .env file
dotenv.config();

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

app.get('/api/videos/:filename/playlist', async (req, res) => {
  try {
    const { filename } = req.params;
    const playlistPath = await getHLSPlaylist(filename);
    if (playlistPath) {
      res.json({ playlistUrl: `/hls/${filename}/index.m3u8` });
    } else {
      res.status(404).json({ error: 'HLS playlist not found' });
    }
  } catch (error) {
    console.error('Error getting playlist:', error);
    res.status(500).json({ error: 'Failed to get playlist' });
  }
});

app.get('/api/videos/:filename/download', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Convert HLS to MP4
    const mp4Path = await convertHLSToMP4(filename);
    
    // Ensure absolute path for sendFile
    const absoluteMp4Path = path.resolve(mp4Path);
    
    // Set headers for file download
    const mp4FileName = `${filename}.mp4`;
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(mp4FileName)}"`);
    
    // Send file
    res.sendFile(absoluteMp4Path, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to send file' });
        }
      }
    });
  } catch (error: any) {
    console.error('Error downloading video:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || 'Failed to download video' });
    }
  }
});

// Cleanup temp files periodically (every hour)
setInterval(() => {
  cleanupTempFiles().catch(console.error);
}, 60 * 60 * 1000);

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

