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
  onRefresh: () => void;
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
  onRefresh,
}) => {
  if (loading && videos.length === 0) {
    return (
      <div className="video-list">
        <div className="video-list-header">
          <h2>Video Library</h2>
          <div className="header-actions">
            <span className="video-count">0 videos</span>
            <button
              className="refresh-button"
              onClick={(e) => {
                e.stopPropagation();
                onRefresh();
              }}
              title="刷新视频列表"
              disabled={loading}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={loading ? 'spinning' : ''}
              >
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            </button>
          </div>
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
          <div className="header-actions">
            <span className="video-count">0 videos</span>
            <button
              className="refresh-button"
              onClick={(e) => {
                e.stopPropagation();
                onRefresh();
              }}
              title="刷新视频列表"
              disabled={loading}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={loading ? 'spinning' : ''}
              >
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            </button>
          </div>
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
        <div className="header-actions">
          <span className="video-count">{videos.length} videos</span>
          <button
            className="refresh-button"
            onClick={(e) => {
              e.stopPropagation();
              onRefresh();
            }}
            title="刷新视频列表"
            disabled={loading}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={loading ? 'spinning' : ''}
            >
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
        </div>
      </div>
      {loading && videos.length > 0 && (
        <div className="refreshing-indicator">
          <span>正在刷新...</span>
        </div>
      )}
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

