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

  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        setLoading(true);
        setError(null);

        if (video.hasHLS) {
          // Get HLS playlist URL
          const response = await fetch(
            `/api/videos/${encodeURIComponent(video.filename)}/playlist`
          );
          const data = await response.json();
          setPlaylistUrl(data.playlistUrl);
        } else {
          // Fallback to direct video file (not recommended for large files)
          setPlaylistUrl(`/api/videos/${encodeURIComponent(video.filename)}`);
        }
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

    if (video.hasHLS && Hls.isSupported()) {
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
    } else if (video.hasHLS && videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      videoElement.src = playlistUrl;
      videoElement.addEventListener('loadedmetadata', () => {
        setLoading(false);
      });
    } else if (!video.hasHLS) {
      // Direct video file playback
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
  }, [playlistUrl, video.hasHLS]);

  return (
    <div className="video-player-container">
      <div className="video-player-header">
        <h2>{video.filename}</h2>
        {video.hasHLS && <span className="hls-indicator">HLS Optimized</span>}
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
            {!video.hasHLS && (
              <p className="error-hint">
                Convert this video to HLS for better playback experience
              </p>
            )}
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
        {!video.hasHLS && (
          <div className="info-warning">
            ⚠️ This video is not optimized. Convert to HLS for better streaming
            performance.
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;

