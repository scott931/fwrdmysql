/**
 * VideoPlayer Component
 *
 * Custom video player with controls and overlay information.
 * Supports both direct video files and YouTube URLs.
 *
 * Features:
 * - Play/pause controls (for direct videos)
 * - Volume controls (for direct videos)
 * - Progress bar with seek functionality (for direct videos)
 * - Time display (for direct videos)
 * - Fullscreen toggle
 * - Custom overlay with lesson information
 * - Hover controls
 * - YouTube video embedding
 *
 * @component
 * @example
 * ```tsx
 * <VideoPlayer lesson={currentLesson} />
 * ```
 */

import React, { useState, useRef, useEffect } from 'react';
import { Maximize2, Pause, Play, Volume2, VolumeX, ExternalLink } from 'lucide-react';
import { Lesson } from '../../types';

interface VideoPlayerProps {
  /** Lesson containing video information */
  lesson: Lesson;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ lesson }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isYouTube, setIsYouTube] = useState(false);
  const [youTubeId, setYouTubeId] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Function to extract YouTube video ID from various YouTube URL formats
  const extractYouTubeId = (url: string): string | null => {
    if (!url) {
      console.log('No URL provided');
      return null;
    }

    // Remove any whitespace
    url = url.trim();
    console.log('Processing URL:', url);

    const patterns = [
      // Standard YouTube URLs
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      // YouTube short URLs
      /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
      // YouTube embed URLs
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      // YouTube URLs with additional parameters
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
      // YouTube URLs with time stamps
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})&?.*$/,
      // YouTube mobile URLs
      /(?:https?:\/\/)?m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/
    ];

    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const match = url.match(pattern);
      if (match && match[1]) {
        console.log(`YouTube ID extracted using pattern ${i + 1}:`, match[1]);
        return match[1];
      }
    }

    console.log('No YouTube ID found for URL:', url);
    return null;
  };

  // Check if the video URL is a YouTube URL and extract ID
  useEffect(() => {
    console.log('=== VideoPlayer: Processing video URL ===');
    console.log('Video URL:', lesson.videoUrl);

    if (!lesson.videoUrl) {
      console.log('No video URL provided');
      setIsLoading(false);
      setHasError(true);
      return;
    }

    const videoUrl = lesson.videoUrl;
    const ytId = extractYouTubeId(videoUrl);

    if (ytId) {
      console.log('✅ YouTube video detected, ID:', ytId);
      setIsYouTube(true);
      setYouTubeId(ytId);
      setHasError(false);

      // For YouTube videos, we'll set loading to false after a short delay
      // to allow the iframe to start loading
      const loadingTimer = setTimeout(() => {
        console.log('Setting YouTube loading to false');
        setIsLoading(false);
      }, 500);

      // Add a timeout to detect if the video takes too long to load
      const timeoutTimer = setTimeout(() => {
        if (isLoading) {
          console.log('YouTube video loading timeout - checking if iframe loaded');
          // Check if iframe has loaded content
          if (iframeRef.current) {
            try {
              // Try to access iframe content (this might fail due to CORS)
              const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
              if (!iframeDoc) {
                console.log('Iframe not accessible - likely still loading or blocked');
              }
            } catch (error) {
              console.log('Iframe access blocked by CORS - this is normal for YouTube');
            }
          }
        }
      }, 10000); // 10 second timeout

      return () => {
        clearTimeout(loadingTimer);
        clearTimeout(timeoutTimer);
      };
    } else {
      console.log('📹 Direct video file detected');
      setIsYouTube(false);
      setYouTubeId('');
      setIsLoading(true);
      setHasError(false);
    }
  }, [lesson.videoUrl]);

  useEffect(() => {
    if (isYouTube) {
      console.log('Skipping video element setup for YouTube video');
      return; // Skip video element setup for YouTube videos
    }

    const video = videoRef.current;
    if (!video) {
      console.log('No video element found');
      return;
    }

    console.log('Setting up video element for direct video');

    const handleTimeUpdate = () => {
      if (video.duration && isFinite(video.duration)) {
        const progress = (video.currentTime / video.duration) * 100;
        setProgress(progress);
        setCurrentTime(video.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded');
      if (video.duration && isFinite(video.duration)) {
        setDuration(video.duration);
        setIsLoading(false);
        setHasError(false);
      }
    };

    const handleCanPlay = () => {
      console.log('Video can play');
      setIsLoading(false);
      setHasError(false);
    };

    const handleError = (e: Event) => {
      console.error('Video error:', video.error, e);
      setIsLoading(false);
      setHasError(true);
    };

    const handleLoadStart = () => {
      console.log('Video load started');
      setIsLoading(true);
      setHasError(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [lesson.videoUrl, isYouTube]);

  // Handle iframe load events for YouTube
  useEffect(() => {
    if (!isYouTube || !iframeRef.current) return;

    const iframe = iframeRef.current;

    const handleIframeLoad = () => {
      console.log('YouTube iframe loaded');
      setIsLoading(false);
      setHasError(false);
    };

    const handleIframeError = () => {
      console.error('YouTube iframe error');
      setIsLoading(false);
      setHasError(true);
    };

    iframe.addEventListener('load', handleIframeLoad);
    iframe.addEventListener('error', handleIframeError);

    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
      iframe.removeEventListener('error', handleIframeError);
    };
  }, [isYouTube, youTubeId]);

  const togglePlay = async () => {
    if (isYouTube || !videoRef.current) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing video:', error);
      setHasError(true);
    }
  };

  const toggleMute = () => {
    if (isYouTube || !videoRef.current) return;

    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isYouTube || !videoRef.current || !duration || !isFinite(duration)) return;

    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const newTime = (percentage / 100) * duration;

    if (isFinite(newTime)) {
      videoRef.current.currentTime = newTime;
    }
  };

  const toggleFullscreen = () => {
    const element = isYouTube ?
      document.querySelector('.youtube-container') as HTMLElement :
      videoRef.current;

    if (!element) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      element.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    }
  };

  const openInYouTube = () => {
    if (youTubeId) {
      window.open(`https://www.youtube.com/watch?v=${youTubeId}`, '_blank');
    }
  };

  // Generate YouTube embed URL with proper parameters
  const getYouTubeEmbedUrl = (videoId: string) => {
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      enablejsapi: '1',
      origin: window.location.origin,
      autoplay: '0',
      controls: '1',
      showinfo: '0',
      fs: '1',
      cc_load_policy: '0',
      iv_load_policy: '3',
      playsinline: '1',
      allowfullscreen: '1'
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  console.log('=== VideoPlayer Render ===');
  console.log('isYouTube:', isYouTube);
  console.log('youTubeId:', youTubeId);
  console.log('isLoading:', isLoading);
  console.log('hasError:', hasError);

  return (
    <div className="relative aspect-video bg-black rounded-md overflow-hidden group">
      {/* YouTube Video */}
      {isYouTube && youTubeId ? (
        <div className="youtube-container w-full h-full relative">
          {/* Loading State for YouTube */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-sm">Loading YouTube video...</p>
              </div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={getYouTubeEmbedUrl(youTubeId)}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            title={lesson.title}
            loading="lazy"
            style={{ border: 'none' }}
            onLoad={() => {
              console.log('YouTube iframe onLoad triggered');
              setIsLoading(false);
              setHasError(false);
            }}
            onError={() => {
              console.error('YouTube iframe onError triggered');
              setIsLoading(false);
              setHasError(true);
            }}
            onAbort={() => {
              console.error('YouTube iframe onAbort triggered');
              setIsLoading(false);
              setHasError(true);
            }}
          />

          {/* YouTube Overlay Controls */}
          {!isLoading && !hasError && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 pointer-events-none">
              {/* Top Info */}
              <div className="text-white">
                <h3 className="font-bold text-lg">{lesson.title}</h3>
                <p className="text-sm text-gray-300 mt-1">YouTube Video</p>
              </div>

              {/* Bottom Controls */}
              <div className="flex justify-between items-center pointer-events-auto">
                <button
                  onClick={openInYouTube}
                  className="text-white hover:text-red-500 transition-colors bg-black/50 px-3 py-2 rounded flex items-center text-sm"
                  title="Open in YouTube"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in YouTube
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-red-500 transition-colors bg-black/50 p-2 rounded"
                  title="Fullscreen"
                >
                  <Maximize2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* YouTube Error State */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
              <div className="text-center text-white p-6 max-w-md">
                <div className="text-red-500 mb-4">
                  <Play className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">YouTube Video Unavailable</h3>
                <p className="text-gray-300 text-sm mb-4">
                  This YouTube video could not be loaded. This might be because:
                </p>
                <ul className="text-gray-400 text-xs mb-4 text-left space-y-1">
                  <li>• The video is private or restricted</li>
                  <li>• The video has been removed</li>
                  <li>• Embedding is disabled for this video</li>
                  <li>• Network connectivity issues</li>
                  <li>• Content filtering or regional restrictions</li>
                </ul>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setHasError(false);
                      setIsLoading(true);
                      // Force iframe reload
                      if (iframeRef.current) {
                        const src = iframeRef.current.src;
                        iframeRef.current.src = '';
                        setTimeout(() => {
                          if (iframeRef.current) {
                            iframeRef.current.src = src;
                          }
                        }, 100);
                      }
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mr-2"
                  >
                    Retry
                  </button>
                  <button
                    onClick={openInYouTube}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Open in YouTube
                  </button>
                  <button
                    onClick={() => {
                      // Try alternative video URL format
                      const alternativeUrl = lesson.videoUrl.replace('youtube.com/watch?v=', 'youtu.be/');
                      if (alternativeUrl !== lesson.videoUrl) {
                        console.log('Trying alternative URL format:', alternativeUrl);
                        // This would require updating the lesson object, but for now just open in new tab
                        window.open(alternativeUrl, '_blank');
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
                  >
                    Try Alternative Format
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Direct Video Element */}
          <video
            ref={videoRef}
            src={lesson.videoUrl}
            className="w-full h-full object-contain"
            onClick={togglePlay}
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
          />

          {/* Loading State */}
          {isLoading && !isYouTube && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-sm">Loading video...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {hasError && !isYouTube && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center text-white p-6 max-w-md">
                <div className="text-red-500 mb-4">
                  <Play className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Video Unavailable</h3>
                <p className="text-gray-300 text-sm mb-4">
                  There was an error loading this video. This might be because:
                </p>
                <ul className="text-gray-400 text-xs mb-4 text-left space-y-1">
                  <li>• The video URL is invalid or broken</li>
                  <li>• The video format is not supported</li>
                  <li>• The video requires authentication</li>
                  <li>• Network connectivity issues</li>
                </ul>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setHasError(false);
                      setIsLoading(true);
                      if (videoRef.current) {
                        videoRef.current.load();
                      }
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mr-2"
                  >
                    Retry
                  </button>
                  {lesson.videoUrl && (
                    <button
                      onClick={() => window.open(lesson.videoUrl, '_blank')}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Open Link
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Controls Overlay for Direct Videos */}
          {!isLoading && !hasError && !isYouTube && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
              {/* Top Info */}
              <div className="text-white">
                <h3 className="font-bold text-lg">{lesson.title}</h3>
              </div>

              {/* Center Play Button */}
              <button
                onClick={togglePlay}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full p-5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8 text-white" />
                ) : (
                  <Play className="h-8 w-8 text-white" />
                )}
              </button>

              {/* Bottom Controls */}
              <div className="flex flex-col space-y-2">
                {/* Progress Bar */}
                <div
                  className="w-full bg-gray-600 h-1 rounded-full overflow-hidden cursor-pointer"
                  onClick={handleProgressClick}
                >
                  <div
                    className="bg-red-600 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                {/* Control Buttons */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <button onClick={togglePlay} className="text-white hover:text-red-500 transition-colors">
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </button>

                    <button onClick={toggleMute} className="text-white hover:text-red-500 transition-colors">
                      {isMuted ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </button>

                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <button onClick={toggleFullscreen} className="text-white hover:text-red-500 transition-colors">
                    <Maximize2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 bg-black/80 text-white text-xs p-2 rounded opacity-75 max-w-xs">
          <div>URL: {lesson.videoUrl}</div>
          <div>YouTube: {isYouTube ? 'Yes' : 'No'}</div>
          {isYouTube && <div>ID: {youTubeId}</div>}
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Error: {hasError ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;