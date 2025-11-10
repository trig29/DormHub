import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// HLS directory - contains pre-converted HLS videos
const HLS_DIR = path.join(__dirname, '../../hls');

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(HLS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Get list of HLS videos from hls folder
// Each video should be in a subfolder with index.m3u8 file
export async function getVideoList() {
  await ensureDirectories();
  
  try {
    const entries = await fs.readdir(HLS_DIR, { withFileTypes: true });
    
    const videos = await Promise.all(
      entries
        .filter(entry => entry.isDirectory())
        .map(async (entry) => {
          const videoDir = path.join(HLS_DIR, entry.name);
          const playlistPath = path.join(videoDir, 'index.m3u8');
          
          // Check if index.m3u8 exists
          try {
            await fs.access(playlistPath);
            
            // Calculate total size of all segments
            const files = await fs.readdir(videoDir);
            let totalSize = 0;
            let modifiedTime = new Date(0);
            
            for (const file of files) {
              const filePath = path.join(videoDir, file);
              const stats = await fs.stat(filePath);
              totalSize += stats.size;
              if (stats.mtime > modifiedTime) {
                modifiedTime = stats.mtime;
              }
            }
            
            return {
              filename: entry.name,
              size: totalSize,
              modified: modifiedTime,
              hasHLS: true,
            };
          } catch {
            // Skip directories without index.m3u8
            return null;
          }
        })
    );
    
    // Filter out null entries
    return videos.filter(video => video !== null);
  } catch (error) {
    console.error('Error reading HLS directory:', error);
    throw error;
  }
}

// Get HLS playlist path if exists
export async function getHLSPlaylist(videoName: string): Promise<string | null> {
  await ensureDirectories();
  
  const playlistPath = path.join(HLS_DIR, videoName, 'index.m3u8');
  
  try {
    await fs.access(playlistPath);
    return playlistPath;
  } catch {
    return null;
  }
}

