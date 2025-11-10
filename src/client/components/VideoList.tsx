import React from 'react';
import './VideoList.css';

interface Video {
  filename: string;
  size: number;
  modified: string;
  hasHLS: boolean;
}

interface VideoListProps {
  videos: Video[];
  loading: boolean;
  selectedVideo: Video | null;
  onVideoSelect: (video: Video) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const VideoList: React.FC<VideoListProps> = ({
  videos,
  loading,
  selectedVideo,
  onVideoSelect,
}) => {
  if (loading) {
    return (
      <div className="video-list">
        <div className="video-list-header">
          <h2>Video Library</h2>
        </div>
        <div className="loading">Loading videos...</div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="video-list">
        <div className="video-list-header">
          <h2>Video Library</h2>
        </div>
        <div className="empty-state">
          <p>No videos found</p>
          <p className="hint">Place HLS video folders in the 'hls' folder</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-list">
      <div className="video-list-header">
        <h2>Video Library</h2>
        <span className="video-count">{videos.length} videos</span>
      </div>
      <div className="video-items">
        {videos.map((video) => (
          <div
            key={video.filename}
            className={`video-item ${selectedVideo?.filename === video.filename ? 'selected' : ''}`}
            onClick={() => onVideoSelect(video)}
          >
            <div className="video-item-header">
              <h3 className="video-title" title={video.filename}>
                {video.filename}
              </h3>
              {video.hasHLS && (
                <span className="hls-badge" title="HLS optimized">HLS</span>
              )}
            </div>
            <div className="video-item-info">
              <span className="video-size">{formatFileSize(video.size)}</span>
              <span className="video-date">{formatDate(video.modified)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoList;

