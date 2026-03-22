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

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
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

  const handleRefresh = async () => {
    await fetchVideos(true);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1><span className="logo-dorm">Dorm</span><span className="logo-hub">Hub</span></h1>
        <p>男寝往事博览馆</p>
      </header>
      <div className="app-content">
        <div className="sidebar">
          <VideoList
            videos={videos}
            loading={loading}
            selectedVideo={selectedVideo}
            onVideoSelect={handleVideoSelect}
            onRefresh={handleRefresh}
          />
        </div>
        <div className="main-content">
          {selectedVideo ? (
            <VideoPlayer video={selectedVideo} />
          ) : (
            <div className="placeholder">
              <h2>选择一个视频开始播放</h2>
              <p>从左侧列表中选择</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

