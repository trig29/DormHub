import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import './VideoPlayer.css';

interface Video {
  filename: string;
  size: number;
  modified: string;
  hasHLS: boolean;
}

interface VideoPlayerProps {
  video: Video;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get HLS playlist URL
        const response = await fetch(
          `/api/videos/${encodeURIComponent(video.filename)}/playlist`
        );
        const data = await response.json();
        setPlaylistUrl(data.playlistUrl);
      } catch (err) {
        console.error('Error loading playlist:', err);
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    loadPlaylist();
  }, [video]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !playlistUrl) return;

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      // Use HLS.js for HLS playback
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });

      hls.loadSource(playlistUrl);
      hls.attachMedia(videoElement);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        videoElement.play().catch((err) => {
          console.error('Error playing video:', err);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Fatal network error, trying to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Fatal media error, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal error, destroying HLS instance');
              hls.destroy();
              setError('Video playback error');
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      videoElement.src = playlistUrl;
      videoElement.addEventListener('loadedmetadata', () => {
        setLoading(false);
      });
    } else {
      setError('HLS is not supported in this browser');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [playlistUrl]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await fetch(
        `/api/videos/${encodeURIComponent(video.filename)}/download`
      );
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${video.filename}.mp4`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading video:', err);
      setError('下载失败，请稍后重试');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="video-player-container">
      <div className="video-player-header">
        <h2>{video.filename}</h2>
        <div className="header-actions">
          <span className="hls-indicator">HLS</span>
          <button
            className="download-button"
            onClick={handleDownload}
            disabled={downloading}
            title="下载视频 (MP4)"
          >
            {downloading ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="spinning"
              >
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            )}
            <span>{downloading ? '转换中...' : '下载'}</span>
          </button>
        </div>
      </div>
      <div className="video-wrapper">
        {loading && (
          <div className="video-loading">
            <div className="spinner"></div>
            <p>Loading video...</p>
          </div>
        )}
        {error && (
          <div className="video-error">
            <p>{error}</p>
          </div>
        )}
        <video
          ref={videoRef}
          controls
          playsInline
          className="video-element"
          style={{ display: loading || error ? 'none' : 'block' }}
        />
      </div>
      <div className="video-info">
        <div className="info-item">
          <span className="info-label">File Size:</span>
          <span className="info-value">
            {(video.size / (1024 * 1024)).toFixed(2)} MB
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Modified:</span>
          <span className="info-value">
            {new Date(video.modified).toLocaleString('zh-CN')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

