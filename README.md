# Dormhub Video Streaming Website

A modern video streaming website with HLS (HTTP Live Streaming) support for optimized video playback experience.

## Features

- 📹 **Video Library Management**: Browse and manage videos stored on the server
- 🚀 **HLS Streaming**: Convert videos to HLS format for optimized streaming
- 🎬 **Modern UI**: Beautiful, responsive interface built with React
- ⚡ **Fast Playback**: Adaptive bitrate streaming for smooth playback
- 🔄 **Auto-conversion**: One-click conversion to HLS format

## Prerequisites

- Node.js (v18 or higher)
- FFmpeg installed on your system

### Installing FFmpeg

**Windows:**
1. Download FFmpeg from https://ffmpeg.org/download.html
2. Extract and add to PATH, or install via chocolatey: `choco install ffmpeg`

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Dormhub
```

2. Install dependencies:
```bash
npm install
```

3. Create a `videos` folder in the project root and add your video files:
```bash
mkdir videos
# Copy your video files to the videos folder
```

## Usage

### Development Mode

Run both server and client in development mode:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

### Production Build

1. Build the project:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
# Or with custom port (8000):
npm run start:prod
```

### Deployment

For detailed deployment instructions, see:
- **Windows Local Testing**: [WINDOWS_TEST.md](./WINDOWS_TEST.md)
- **Cloud Server Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Virtual Environment (Docker)**: [VIRTUAL_ENV.md](./VIRTUAL_ENV.md)

### Docker Quick Start

```bash
# Development environment
npm run docker:dev

# Production environment
npm run docker:prod
```

### Mobile Support

The application is fully optimized for mobile devices (iOS and Android). See [MOBILE_SUPPORT.md](./MOBILE_SUPPORT.md) for details.

**Key Features:**
- ✅ Responsive design for phones and tablets
- ✅ Touch-optimized controls
- ✅ HLS streaming support
- ✅ Inline video playback
- ✅ Fullscreen support

## Project Structure

```
Dormhub/
├── src/
│   ├── server/          # Backend server code
│   │   ├── index.ts     # Express server setup
│   │   └── videoService.ts  # Video processing logic
│   └── client/          # Frontend React application
│       ├── components/   # React components
│       └── App.tsx      # Main application component
├── videos/              # Video files directory (create this)
├── hls/                 # HLS output directory (auto-created)
└── dist/                # Build output
```

## API Endpoints

- `GET /api/videos` - Get list of all videos
- `POST /api/videos/:filename/convert` - Convert video to HLS format
- `GET /api/videos/:filename/playlist` - Get HLS playlist URL

## How It Works

1. **Video Storage**: Place your video files in the `videos` folder
2. **HLS Conversion**: Click "Convert to HLS" button to convert videos to HLS format
3. **Streaming**: HLS format splits videos into small segments for efficient streaming
4. **Playback**: The player uses hls.js library for adaptive bitrate streaming

## Supported Video Formats

Input formats: `.mp4`, `.avi`, `.mov`, `.mkv`, `.webm`, `.flv`, `.wmv`

Output format: HLS (`.m3u8` playlist with `.ts` segments)

## Configuration

You can modify the video directory path in `src/server/videoService.ts`:

```typescript
const VIDEO_DIR = path.join(__dirname, '../../videos');
```

## Browser Support

- Chrome/Edge: Full HLS support via hls.js
- Firefox: Full HLS support via hls.js
- Safari: Native HLS support

## Troubleshooting

**FFmpeg not found:**
- Ensure FFmpeg is installed and available in your PATH
- Verify installation: `ffmpeg -version`

**Videos not showing:**
- Check that video files are in the `videos` folder
- Ensure video files have supported extensions

**Conversion fails:**
- Check FFmpeg installation
- Verify video file is not corrupted
- Check server logs for detailed error messages

## License

MIT

