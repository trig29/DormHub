import React, { useState, useEffect } from 'react';
import VideoList from './components/VideoList';
import VideoPlayer from './components/VideoPlayer';
import './App.css';

interface Video {
  filename: string;
  size: number;
  modified: string;
  hasHLS: boolean;
}

function App() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState<string | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  const handleConvert = async (filename: string) => {
    setConverting(filename);
    try {
      const response = await fetch(`/api/videos/${encodeURIComponent(filename)}/convert`, {
        method: 'POST',
      });
      if (response.ok) {
        // Poll for conversion completion
        const checkInterval = setInterval(async () => {
          await fetchVideos();
          const video = videos.find(v => v.filename === filename);
          if (video?.hasHLS) {
            clearInterval(checkInterval);
            setConverting(null);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error converting video:', error);
      setConverting(null);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎬 Dormhub</h1>
        <p>Based on HLS Optimized Video Player</p>
      </header>
      <div className="app-content">
        <div className="sidebar">
          <VideoList
            videos={videos}
            loading={loading}
            selectedVideo={selectedVideo}
            onVideoSelect={handleVideoSelect}
            onConvert={handleConvert}
            converting={converting}
          />
        </div>
        <div className="main-content">
          {selectedVideo ? (
            <VideoPlayer video={selectedVideo} />
          ) : (
            <div className="placeholder">
              <h2>Select a video to start playing</h2>
              <p>Choose a video from the list on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

