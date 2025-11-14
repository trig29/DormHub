import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// HLS directory - contains pre-converted HLS videos
const HLS_DIR = path.join(__dirname, '../../hls');
// Temp directory for converted MP4 files
const TEMP_DIR = path.join(__dirname, '../../temp');

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(HLS_DIR, { recursive: true });
    await fs.mkdir(TEMP_DIR, { recursive: true });
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

// Convert HLS to MP4 using ffmpeg (no transcoding, just copy)
export async function convertHLSToMP4(videoName: string): Promise<string> {
  await ensureDirectories();
  
  const playlistPath = path.join(HLS_DIR, videoName, 'index.m3u8');
  const outputPath = path.join(TEMP_DIR, `${videoName}.mp4`);
  
  // Check if playlist exists
  try {
    await fs.access(playlistPath);
  } catch {
    throw new Error(`HLS playlist not found: ${videoName}`);
  }
  
  // Check if MP4 already exists and is recent (within 1 hour)
  try {
    const stats = await fs.stat(outputPath);
    const now = Date.now();
    const fileTime = stats.mtime.getTime();
    const oneHour = 60 * 60 * 1000;
    
    if (now - fileTime < oneHour) {
      // File exists and is recent, return it
      return outputPath;
    }
  } catch {
    // File doesn't exist, need to create it
  }
  
  // Convert HLS to MP4 using ffmpeg with copy codec (no transcoding)
  const absolutePlaylistPath = path.resolve(playlistPath);
  const absoluteOutputPath = path.resolve(outputPath);
  
  // Use absolute paths and escape for shell
  const command = `ffmpeg -i "${absolutePlaylistPath}" -c copy -y "${absoluteOutputPath}"`;
  
  try {
    await execAsync(command);
    console.log(`Successfully converted ${videoName} to MP4`);
    return outputPath;
  } catch (error: any) {
    console.error(`FFmpeg conversion error for ${videoName}:`, error);
    throw new Error(`Failed to convert HLS to MP4: ${error.message}`);
  }
}

// Clean up old temporary files (older than 1 hour)
export async function cleanupTempFiles(): Promise<void> {
  try {
    const files = await fs.readdir(TEMP_DIR);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const file of files) {
      if (file.endsWith('.mp4')) {
        const filePath = path.join(TEMP_DIR, file);
        try {
          const stats = await fs.stat(filePath);
          const fileTime = stats.mtime.getTime();
          
          if (now - fileTime > oneHour) {
            await fs.unlink(filePath);
            console.log(`Cleaned up old temp file: ${file}`);
          }
        } catch (error) {
          console.error(`Error cleaning up ${file}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error during temp file cleanup:', error);
  }
}

