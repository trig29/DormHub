import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ffmpeg from 'fluent-ffmpeg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Video directory - change this to your video folder path
const VIDEO_DIR = path.join(__dirname, '../../videos');
const HLS_DIR = path.join(__dirname, '../../hls');

// Ensure directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(VIDEO_DIR, { recursive: true });
    await fs.mkdir(HLS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Get list of video files
export async function getVideoList() {
  await ensureDirectories();
  
  try {
    const files = await fs.readdir(VIDEO_DIR);
    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv'];
    
    const videos = await Promise.all(
      files
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return videoExtensions.includes(ext);
        })
        .map(async (file) => {
          const filePath = path.join(VIDEO_DIR, file);
          const stats = await fs.stat(filePath);
          const outputName = path.basename(file, path.extname(file));
          const hlsPath = path.join(HLS_DIR, outputName, 'index.m3u8');
          
          let hasHLS = false;
          try {
            await fs.access(hlsPath);
            hasHLS = true;
          } catch {
            hasHLS = false;
          }
          
          return {
            filename: file,
            size: stats.size,
            modified: stats.mtime,
            hasHLS,
          };
        })
    );
    
    return videos;
  } catch (error) {
    console.error('Error reading video directory:', error);
    throw error;
  }
}

// Convert video to HLS format
export async function convertToHLS(filename: string): Promise<void> {
  await ensureDirectories();
  
  const inputPath = path.join(VIDEO_DIR, filename);
  const outputName = path.basename(filename, path.extname(filename));
  const outputDir = path.join(HLS_DIR, outputName);
  const outputPath = path.join(outputDir, 'index.m3u8');
  
  // Check if input file exists
  try {
    await fs.access(inputPath);
  } catch {
    throw new Error(`Video file not found: ${filename}`);
  }
  
  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });
  
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-c:v libx264',
        '-c:a aac',
        '-hls_time 10',
        '-hls_playlist_type vod',
        '-hls_segment_filename', path.join(outputDir, 'segment_%03d.ts'),
        '-f hls',
      ])
      .output(outputPath)
      .on('end', () => {
        console.log(`HLS conversion completed: ${filename}`);
        resolve();
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      })
      .run();
  });
}

// Get HLS playlist path if exists
export async function getHLSPlaylist(filename: string): Promise<string | null> {
  await ensureDirectories();
  
  const outputName = path.basename(filename, path.extname(filename));
  const playlistPath = path.join(HLS_DIR, outputName, 'index.m3u8');
  
  try {
    await fs.access(playlistPath);
    return playlistPath;
  } catch {
    return null;
  }
}

