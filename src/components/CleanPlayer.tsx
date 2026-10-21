import React, { useCallback, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { StreamSource, MediaMeta } from '../services/tgvid';

// ============================================================================
// EXACT TGFLIX SVG ICONS REPRODUCED FROM PLAYERSHELL & USER SCREENSHOT
// ============================================================================

// Large Solid White Play Triangle for Screen Center (Exact Screenshot ▶)
const CenterPlayIcon = ({ className = "size-14" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6 20.1957V3.80421C6 3.01878 6.86395 2.53993 7.53 2.95621L20.6432 11.152C21.2699 11.5436 21.2699 12.4563 20.6432 12.848L7.53 21.0437C6.86395 21.46 6 20.9812 6 20.1957Z" />
  </svg>
);

// Large Solid White Pause Bars for Screen Center (Exact Screenshot ⏸)
const CenterPauseIcon = ({ className = "size-14" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6 5H10V19H6V5ZM14 5H18V19H14V5Z" />
  </svg>
);

// Rewind 15s Icon (Exact Screenshot ↺15)
const Backward15Icon = ({ className = "size-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12H4C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C9.53613 4 7.33237 5.11383 5.86494 6.86543L7.50006 8.5H12V12.75H9.125C8.77982 12.75 8.5 13.0298 8.5 13.375C8.5 13.7202 8.77982 14 9.125 14H12V15.5H9.125C7.95139 15.5 7 14.5486 7 13.375C7 12.2014 7.95139 11.25 9.125 11.25H10.5V10H7.25V9H2V3L4.44659 5.44648C6.28003 3.33509 8.98413 2 12 2ZM15.5 8.5H14V15.5H15.5V8.5Z" />
  </svg>
);

// Forward 15s Icon (Exact Screenshot ↻15)
const Forward15Icon = ({ className = "size-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12H20C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C14.4639 4 16.6676 5.11383 18.1351 6.86543L16.5001 8.5H12V12.75H14.875C15.2202 12.75 15.5 13.0298 15.5 13.375C15.5 13.7202 15.2202 14 14.875 14H12V15.5H14.875C16.0486 15.5 17 14.5486 17 13.375C17 12.2014 16.0486 11.25 14.875 11.25H13.5V10H16.75V9H22V3L19.5534 5.44648C17.72 3.33509 15.0159 2 12 2ZM8.5 8.5H10V15.5H8.5V8.5Z" />
  </svg>
);

// Volume Speaker Icon (Exact Screenshot)
const VolumeIcon = ({ className = "size-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M2 16.0001H5.88889L11.1834 20.3319C11.2727 20.405 11.3846 20.4449 11.5 20.4449C11.7761 20.4449 12 20.2211 12 19.9449V4.05519C12 3.93977 11.9601 3.8279 11.887 3.73857C11.7121 3.52485 11.3971 3.49335 11.1834 3.66821L5.88889 8.00007H2C1.44772 8.00007 1 8.44778 1 9.00007V15.0001C1 15.5524 1.44772 16.0001 2 16.0001ZM23 12C23 15.292 21.5539 18.2463 19.2622 20.2622L17.8445 18.8444C19.7758 17.1937 21 14.757 21 12C21 9.24304 19.7758 6.80628 17.8445 5.15557L19.2622 3.73778C21.5539 5.75373 23 8.70802 23 12Z" />
  </svg>
);

const VolumeMuteIcon = ({ className = "size-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M2 16H5.88889L11.1834 20.3318C11.2727 20.4049 11.3846 20.4448 11.5 20.4448C11.7761 20.4448 12 20.221 12 19.9448V4.05513C12 3.93971 11.9601 3.82784 11.887 3.73851C11.7121 3.52479 11.3971 3.49329 11.1834 3.66815L5.88889 8.00001H2C1.44772 8.00001 1 8.44772 1 9.00001V15C1 15.5523 1.44772 16 2 16ZM22.7071 8.70711L21.2929 7.29289L18 10.5858L14.7071 7.29289L13.2929 8.70711L16.5858 12L13.2929 15.2929L14.7071 16.7071L18 13.4142L21.2929 16.7071L22.7071 15.2929L19.4142 12L22.7071 8.70711Z" />
  </svg>
);

// Subtitles CC Box Icon (Exact Screenshot [=])
const SubtitlesIcon = ({ className = "size-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="14" x="3" y="5" rx="2" />
    <path d="M7 15h4M15 15h2M7 11h2M13 11h4" />
  </svg>
);

// HD Badge Icon (Exact Screenshot [ HD ])
const HdQualityIcon = ({ className = "size-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="15" x="2" y="4.5" rx="2" />
    <path d="M7 9v6M7 12h3M10 9v6M14 9h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2z" />
  </svg>
);

// Settings Gear Icon (Exact Screenshot ⚙️)
const SettingsGearIcon = ({ className = "size-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M5.33409 4.54491C6.3494 3.63637 7.55145 2.9322 8.87555 2.49707C9.60856 3.4128 10.7358 3.99928 12 3.99928C13.2642 3.99928 14.3914 3.4128 15.1245 2.49707C16.4486 2.9322 17.6506 3.63637 18.6659 4.54491C18.2405 5.637 18.2966 6.90531 18.9282 7.99928C19.5602 9.09388 20.6314 9.77679 21.7906 9.95392C21.9279 10.6142 22 11.2983 22 11.9993C22 12.7002 21.9279 13.3844 21.7906 14.0446C20.6314 14.2218 19.5602 14.9047 18.9282 15.9993C18.2966 17.0933 18.2405 18.3616 18.6659 19.4536C17.6506 20.3622 16.4486 21.0664 15.1245 21.5015C14.3914 20.5858 13.2642 19.9993 12 19.9993C10.7358 19.9993 9.60856 20.5858 8.87555 21.5015C7.55145 21.0664 6.3494 20.3622 5.33409 19.4536C5.75952 18.3616 5.7034 17.0933 5.0718 15.9993C4.43983 14.9047 3.36862 14.2218 2.20935 14.0446C2.07212 13.3844 2 12.7002 2 11.9993C2 11.2983 2.07212 10.6142 2.20935 9.95392C3.36862 9.77679 4.43983 9.09388 5.0718 7.99928C5.7034 6.90531 5.75952 5.637 5.33409 4.54491ZM13.5 14.5974C14.9349 13.7689 15.4265 11.9342 14.5981 10.4993C13.7696 9.0644 11.9349 8.57277 10.5 9.4012C9.06512 10.2296 8.5735 12.0644 9.40192 13.4993C10.2304 14.9342 12.0651 15.4258 13.5 14.5974Z" />
  </svg>
);

// Fullscreen Expand Icon (Exact Screenshot ⛶)
const FullscreenIcon = ({ className = "size-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.5858 5H14V3H21V10H19V6.41421L14.7071 10.7071L13.2929 9.29289L17.5858 5ZM3 14H5V17.5858L9.29289 13.2929L10.7071 14.7071L6.41421 19H10V21H3V14Z" />
  </svg>
);

// Dual Stacked Server Box Icon (Top Right in Screenshot)
const ServersIcon = ({ className = "size-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="8" x="2" y="2" rx="2" />
    <rect width="20" height="8" x="2" y="14" rx="2" />
    <path d="M6 6h.01M6 18h.01" />
  </svg>
);

// Cloud Icon for Loading Screen
const CloudIcon = ({ className = "size-7" }: { className?: string }) => (
  <svg viewBox="0 0 24 16" fill="currentColor" className={className}>
    <path d="M19.4 6.04A7.49 7.49 0 0 0 5.35 4.04 6 6 0 0 0 6 16h13a5 5 0 0 0 .4-9.96Z" />
  </svg>
);

interface CleanPlayerProps {
  sources: StreamSource[];
  meta?: MediaMeta;
  title: string;
  onServerChange?: (server: StreamSource) => void;
  showBackButtonSimulation?: boolean;
  showWatermarkSimulation?: boolean;
}

export const CleanPlayer: React.FC<CleanPlayerProps> = ({
  sources,
  meta,
  title,
  showBackButtonSimulation = false,
  showWatermarkSimulation = false,
  onServerChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const previewHlsRef = useRef<Hls | null>(null);

  const [selectedSourceIndex, setSelectedSourceIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [bufferedEnd, setBufferedEnd] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  // Loading states:
  // - isInitialLoad: server-specific loading screen only on initial load / server switch
  // - isBuffering: normal circular loading indicator during subsequent seeking/waiting
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Scrubber Hover / Drag state
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showSeekPreview, setShowSeekPreview] = useState<boolean>(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);

  // Menus
  const [activeMenu, setActiveMenu] = useState<'servers' | 'audio' | 'quality' | 'speed' | null>(null);
  const [qualityLevels, setQualityLevels] = useState<{ id: number; name: string }[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1);
  const [audioTracks, setAudioTracks] = useState<{ id: number; name: string; lang: string }[]>([]);
  const [currentAudio, setCurrentAudio] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPortrait, setIsPortrait] = useState<boolean>(false);

  const isDraggingRef = useRef<boolean>(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Server failover, retry and watchdog timer refs
  const failedSourcesRef = useRef<Set<number>>(new Set());
  const sourceRetryCountRef = useRef<number>(0);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSwitchingServerRef = useRef<boolean>(false);

  // Seek preview throttling & queued seek refs to avoid freezing video decoders
  const previewSeekingRef = useRef<boolean>(false);
  const pendingPreviewTimeRef = useRef<number | null>(null);
  const lastPreviewSeekReqRef = useRef<number>(0);

  const currentSource = sources[selectedSourceIndex] || sources[0];

  // Automatic Server Failover: when a stream fails, automatically try the next untried server
  const tryNextServer = useCallback((failedIndex: number, reason: string) => {
    if (isSwitchingServerRef.current) return;
    isSwitchingServerRef.current = true;

    failedSourcesRef.current.add(failedIndex);
    console.warn(`[Bilota Player] Source ${failedIndex} (${sources[failedIndex]?.server || 'unknown'}) failed: ${reason}`);

    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch {}
      hlsRef.current = null;
    }

    // Find next untried server in sources
    let nextIdx = -1;
    for (let i = 0; i < sources.length; i++) {
      const candidateIdx = (failedIndex + 1 + i) % sources.length;
      if (!failedSourcesRef.current.has(candidateIdx)) {
        nextIdx = candidateIdx;
        break;
      }
    }

    if (nextIdx !== -1) {
      console.log(`[Bilota Player] Automatically failing over to source ${nextIdx} (${sources[nextIdx]?.server || nextIdx})...`);
      setIsInitialLoad(true);
      setError(null);
      setSelectedSourceIndex(nextIdx);
      if (onServerChange && sources[nextIdx]) {
        onServerChange(sources[nextIdx]);
      }
      setTimeout(() => {
        isSwitchingServerRef.current = false;
      }, 300);
    } else {
      console.error('[Bilota Player] All sources have been tried and failed.');
      setIsInitialLoad(false);
      setError(`All ${sources.length} available stream servers failed to connect. Please select another server or try again.`);
      isSwitchingServerRef.current = false;
    }
  }, [sources, onServerChange]);

  // User explicit server switch
  const switchServer = useCallback((idx: number) => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    // Allow re-trying this server
    failedSourcesRef.current.delete(idx);
    sourceRetryCountRef.current = 0;
    setSelectedSourceIndex(idx);
    if (onServerChange && sources[idx]) {
      onServerChange(sources[idx]);
    }
    setError(null);
    setIsInitialLoad(true);
    setActiveMenu(null);
  }, [sources, onServerChange]);

  // Reset server index and failover tracking when sources array changes (e.g., new title selected)
  useEffect(() => {
    setSelectedSourceIndex(0);
    failedSourcesRef.current.clear();
    sourceRetryCountRef.current = 0;
    setError(null);
    setIsInitialLoad(true);
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  }, [sources]);

  // Initialize and load stream
  useEffect(() => {
    if (!currentSource || !videoRef.current) return;

    setError(null);
    setIsInitialLoad(true);
    setIsBuffering(false);
    sourceRetryCountRef.current = 0;

    const video = videoRef.current;
    const previewVideo = previewVideoRef.current;

    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch {}
      hlsRef.current = null;
    }
    if (previewHlsRef.current) {
      try {
        previewHlsRef.current.destroy();
      } catch {}
      previewHlsRef.current = null;
    }

    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }

    const streamUrl = currentSource.url;

    if (previewVideo) {
      previewVideo.muted = true;
      previewVideo.volume = 0;
    }

    // Set a 6.5s watchdog timeout: if manifest/stream doesn't parse, failover to next server
    loadingTimeoutRef.current = setTimeout(() => {
      console.warn(`[Bilota Player] Loading timeout on server ${selectedSourceIndex} (${currentSource.server})`);
      tryNextServer(selectedSourceIndex, 'Connection timed out');
    }, 6500);

    const handleLoaded = () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setIsInitialLoad(false);
      setError(null);
    };

    const handleVideoError = () => {
      console.warn(`[Bilota Player] Native video error on server ${selectedSourceIndex}:`, video.error);
      tryNextServer(selectedSourceIndex, video.error?.message || 'Video decode error');
    };

    video.addEventListener('loadedmetadata', handleLoaded);
    video.addEventListener('canplay', handleLoaded);
    video.addEventListener('error', handleVideoError);

    const isHlsStream = currentSource.type === 'hls' || 
      streamUrl.includes('.m3u8') || 
      streamUrl.includes('/api/out') || 
      streamUrl.includes('/api/kai') || 
      streamUrl.includes('/api/hub') || 
      streamUrl.includes('/api/tg');

    if (Hls.isSupported() && isHlsStream) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        handleLoaded();
        const levels = data.levels.map((lvl, index) => ({
          id: index,
          name: lvl.height ? `${lvl.height}p` : `Level ${index + 1}`
        }));
        setQualityLevels([{ id: -1, name: 'Auto' }, ...levels]);
      });

      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_, data) => {
        const tracks = data.audioTracks.map((tr, index) => ({
          id: index,
          name: tr.name || tr.lang || `Track ${index + 1}`,
          lang: tr.lang || ''
        }));
        setAudioTracks(tracks);
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR: {
              const httpStatus = data.response?.code;
              // HTTP 403, 404, 502 or already retried: failover immediately to next server!
              if (httpStatus === 403 || httpStatus === 404 || httpStatus === 502 || sourceRetryCountRef.current >= 1) {
                tryNextServer(selectedSourceIndex, `HTTP ${httpStatus || 'Network'} error`);
              } else {
                sourceRetryCountRef.current += 1;
                console.warn(`[Bilota Player] Retrying network load once for server ${selectedSourceIndex}...`);
                hls.startLoad();
              }
              break;
            }
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('[Bilota Player] Media error, attempting recovery...');
              hls.recoverMediaError();
              break;
            default:
              tryNextServer(selectedSourceIndex, data.details || 'Fatal decoder error');
              break;
          }
        }
      });

      // Initialize secondary lightweight HLS for seek preview
      if (previewVideo) {
        try {
          const previewHls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            autoStartLoad: true,
            maxBufferLength: 10,
            maxMaxBufferLength: 20,
            startLevel: 0,
          });
          previewHlsRef.current = previewHls;
          previewHls.loadSource(streamUrl);
          previewHls.attachMedia(previewVideo);

          previewHls.on(Hls.Events.MANIFEST_PARSED, () => {
            previewHls.currentLevel = 0;
          });

          previewHls.on(Hls.Events.ERROR, (_, pData) => {
            if (pData.fatal) {
              if (pData.type === Hls.ErrorTypes.NETWORK_ERROR) {
                previewHls.startLoad();
              } else if (pData.type === Hls.ErrorTypes.MEDIA_ERROR) {
                previewHls.recoverMediaError();
              }
            }
          });
        } catch {}
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl') && isHlsStream) {
      video.src = streamUrl;
      if (previewVideo) {
        previewVideo.src = streamUrl;
      }
    } else {
      video.src = streamUrl;
      if (previewVideo) {
        previewVideo.src = streamUrl;
      }
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      video.removeEventListener('loadedmetadata', handleLoaded);
      video.removeEventListener('canplay', handleLoaded);
      video.removeEventListener('error', handleVideoError);
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch {}
        hlsRef.current = null;
      }
      if (previewHlsRef.current) {
        try {
          previewHlsRef.current.destroy();
        } catch {}
        previewHlsRef.current = null;
      }
    };
  }, [currentSource, selectedSourceIndex, tryNextServer]);


  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (isFs) {
        setIsPortrait(window.innerHeight > window.innerWidth);
      } else {
        setIsPortrait(false);
        if (screen.orientation && typeof (screen.orientation as any).unlock === 'function') {
          try {
            (screen.orientation as any).unlock();
          } catch {}
        }
      }
    };
    const handleResize = () => {
      if (document.fullscreenElement) {
        setIsPortrait(window.innerHeight > window.innerWidth);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);

      const buf = videoRef.current.buffered;
      if (buf && buf.length > 0) {
        setBufferedEnd(buf.end(buf.length - 1));
      }
    }
  };

  const handlePlaying = () => {
    setIsPlaying(true);
    setIsInitialLoad(false);
    setIsBuffering(false);
  };

  const handleWaiting = () => {
    if (!isInitialLoad) {
      setIsBuffering(true);
    }
  };

  const handleSeeking = () => {
    if (!isInitialLoad) {
      setIsBuffering(true);
    }
  };

  const handleSeeked = () => {
    setIsBuffering(false);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const seekBy = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
  };

  // Throttled & queued seek preview handler to keep video playback smooth and responsive
  const requestPreviewSeek = useCallback((targetTime: number) => {
    const pVideo = previewVideoRef.current;
    if (!pVideo || !isFinite(targetTime)) return;

    const clampedTime = Math.max(0, Math.min(targetTime, duration > 0 ? duration : targetTime));

    // If currently seeking, queue this target time for when 'seeked' event fires
    if (pVideo.seeking || previewSeekingRef.current) {
      pendingPreviewTimeRef.current = clampedTime;
      return;
    }

    // Rate-limit seeks to at most once per 60ms to avoid overloading the video decoder
    const now = Date.now();
    if (now - lastPreviewSeekReqRef.current < 60) {
      pendingPreviewTimeRef.current = clampedTime;
      return;
    }

    lastPreviewSeekReqRef.current = now;
    previewSeekingRef.current = true;
    try {
      pVideo.currentTime = clampedTime;
    } catch {
      previewSeekingRef.current = false;
    }
  }, [duration]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    setShowSeekPreview(true);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clampedX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setHoverPosition(clampedX);

    if (duration > 0) {
      const time = (clampedX / rect.width) * duration;
      setHoverTime(time);
      requestPreviewSeek(time);
    }

    seekFromPointer(e.clientX, e.currentTarget);
    showControlsTemporarily();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clampedX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));

    // On mouse hover or active dragging, update preview position & time
    if (e.pointerType === 'mouse' || isDraggingRef.current) {
      setHoverPosition(clampedX);
      setShowSeekPreview(true);
      if (duration > 0) {
        const time = (clampedX / rect.width) * duration;
        setHoverTime(time);
        requestPreviewSeek(time);
      }
    }

    if (isDraggingRef.current) {
      seekFromPointer(e.clientX, e.currentTarget);
      showControlsTemporarily();
    }
  };

  // When user releases the scrubber ("aage karke chod dete hai to wo Gayab ho jana chahiye"):
  // Hide seek preview immediately and clear hover state!
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    setIsDragging(false);
    setShowSeekPreview(false);
    setHoverPosition(null);
    setHoverTime(null);
    pendingPreviewTimeRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    setIsDragging(false);
    setShowSeekPreview(false);
    setHoverPosition(null);
    setHoverTime(null);
    pendingPreviewTimeRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const seekFromPointer = (clientX: number, target: HTMLDivElement) => {
    const rect = target.getBoundingClientRect();
    const pos = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = pos / rect.width;
    if (videoRef.current && duration > 0) {
      videoRef.current.currentTime = percent * duration;
      setCurrentTime(percent * duration);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
        if (screen.orientation && typeof (screen.orientation as any).lock === 'function') {
          try {
            await (screen.orientation as any).lock('landscape-primary');
          } catch {
            try {
              await (screen.orientation as any).lock('landscape');
            } catch {}
          }
        }
      } else {
        if (screen.orientation && typeof (screen.orientation as any).unlock === 'function') {
          try {
            (screen.orientation as any).unlock();
          } catch {}
        }
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn("Fullscreen/Orientation error:", err);
    }
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !activeMenu) {
        setShowControls(false);
      }
    }, 3500);
  };

  // Screen tap handler:
  // - Tap when hidden: show all playback controls immediately (even if playing, without pausing)
  // - Tap when visible: fade out all currently visible playback controls immediately
  const handleScreenTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    // Don't toggle screen controls if user clicked an interactive control or the scrubber
    if (target.closest('button, input, select, [role="button"], .interactive-control, .group\\/bar')) {
      return;
    }

    if (showControls) {
      setShowControls(false);
      setActiveMenu(null);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
      showControlsTemporarily();
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if (e.code === 'Space' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
        showControlsTemporarily();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekBy(-15);
        showControlsTemporarily();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekBy(15);
        showControlsTemporarily();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        if (videoRef.current) {
          const newMuted = !isMuted;
          videoRef.current.muted = newMuted;
          setIsMuted(newMuted);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, duration]);

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onClick={handleScreenTap}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => {
        if (isPlaying && !activeMenu) setShowControls(false);
      }}
      className={`vs-root relative bg-black overflow-hidden select-none group font-['Lexend_Deca',sans-serif] ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full aspect-video'}`}
      style={{
        '--vs-red': '#e11d2e',
        ...(isFullscreen && isPortrait ? {
          width: '100vh',
          height: '100vw',
          transform: 'rotate(90deg)',
          transformOrigin: 'top left',
          position: 'fixed',
          top: '0',
          left: '0',
        } : isFullscreen ? {
          width: '100vw',
          height: '100vh',
        } : {}),
      } as React.CSSProperties & Record<string, any>}
    >
      {/* 1. ACTUAL VIDEO STREAM */}
      <video
        ref={videoRef}
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onPlaying={handlePlaying}
        onWaiting={handleWaiting}
        onSeeking={handleSeeking}
        onSeeked={handleSeeked}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* 2. EXACT TGFLIX LOADING SCREEN (Only shown on initial playback load / server switch) */}
      {isInitialLoad && (
        <div 
          className="absolute inset-0 z-30 overflow-hidden bg-black select-none pointer-events-auto"
          style={{ fontFamily: "'Lexend Deca', sans-serif" }}
        >
          {meta?.backdrop && (
            <img
              src={meta.backdrop}
              alt=""
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-[28px]"
            />
          )}

          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.85) 90%)',
            }}
          />

          <div className="absolute right-[26px] top-[38px] hidden sm:block opacity-80 text-[#d4d4d4]">
            <CloudIcon className="w-[36px] h-[26px]" />
          </div>

          <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
            {meta?.logo ? (
              <div className="flex items-center justify-center max-w-[85vw] max-h-[140px] sm:max-h-[190px] mb-3">
                <img
                  src={meta.logo}
                  alt={title}
                  className="max-h-24 sm:max-h-36 max-w-[320px] sm:max-w-[500px] object-contain drop-shadow-[0_8px_32px_rgba(0,0,0,0.95)]"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallbackEl = document.getElementById('loading-title-fallback');
                    if (fallbackEl) fallbackEl.style.display = 'block';
                  }}
                />
                <h1
                  id="loading-title-fallback"
                  className="hidden text-2xl font-bold sm:text-4xl uppercase tracking-widest text-white drop-shadow-2xl"
                  style={{ fontFamily: 'Anton, sans-serif' }}
                >
                  {title}
                </h1>
              </div>
            ) : (
              <h1
                className="text-2xl font-bold sm:text-4xl uppercase tracking-widest text-white drop-shadow-2xl"
                style={{ fontFamily: 'Anton, sans-serif' }}
              >
                {title}
              </h1>
            )}

            {meta?.genres && meta.genres.length > 0 && (
              <p
                className="mt-3 text-[12px] uppercase tracking-[0.3em] font-medium text-white/60"
              >
                {meta.genres.join(' / ')}
              </p>
            )}

            <p
              className="mt-6 text-[13px] sm:text-[15px] uppercase tracking-wide text-white"
              style={{ fontFamily: 'Audiowide, sans-serif' }}
            >
              Connecting to {currentSource?.server || 'Server'}
              <span className="animate-vsBlink inline-block ml-0.5">_</span>
            </p>

            <div
              className="relative mt-6 h-[4px] w-[300px] max-w-[70vw] overflow-hidden rounded-full bg-white/20"
            >
              <div className="absolute inset-y-0 w-1/4 rounded-full bg-white animate-vsSlide" />
            </div>

            <p className="mt-6 text-[14px] sm:text-[16px] text-white font-medium">
              {currentSource?.server || 'Server'}{' '}
              <span className="mx-2 text-white/30">/</span> Source{' '}
              {String(selectedSourceIndex + 1).padStart(2, '0')}
            </p>

            {failedSourcesRef.current.size > 0 && (
              <p className="mt-2 text-[12px] text-amber-300 font-mono bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                Previous server offline. Trying alternate server ({selectedSourceIndex + 1}/{sources.length})...
              </p>
            )}

            {sources.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === 'servers' ? null : 'servers');
                }}
                className="mt-4 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs text-white/90 border border-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <ServersIcon className="size-4" />
                <span>Switch Server ({selectedSourceIndex + 1}/{sources.length})</span>
              </button>
            )}
          </div>

          <p className="absolute bottom-9 left-0 right-0 hidden sm:block text-center text-[17px] text-white/80 font-medium">
            Press F to enter fullscreen.
          </p>
        </div>
      )}

      {/* 2c. DEDICATED PLAYBACK ERROR OVERLAY */}
      {error && (
        <div 
          className="absolute inset-0 z-35 flex flex-col items-center justify-center p-6 bg-black/95 select-none text-center text-white pointer-events-auto"
          style={{ fontFamily: "'Lexend Deca', sans-serif" }}
        >
          <div className="max-w-md space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-7">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Stream Temporarily Unavailable</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">{error}</p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  failedSourcesRef.current.clear();
                  switchServer(0);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#e11d2e] hover:bg-[#c71827] text-white text-xs font-bold shadow-lg shadow-red-500/25 transition cursor-pointer"
              >
                Retry From Server 1
              </button>
              <button
                type="button"
                onClick={() => setActiveMenu('servers')}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition cursor-pointer"
              >
                Choose Another Server
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2b. NORMAL LOADING INDICATOR (Subsequent Seeking / Buffering) */}
      {!isInitialLoad && isBuffering && (
        <div className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none bg-black/25 backdrop-blur-[1px] transition-opacity duration-200">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[3px] border-white/20 border-t-[#e11d2e] animate-spin shadow-[0_0_15px_rgba(225,29,46,0.5)]" />
        </div>
      )}

      {/* 3. TOP-LEFT "YOU'RE WATCHING" HEADER (Exact Screenshot Layout) */}
      <div 
        className={`absolute top-4 left-4 z-20 flex items-center transition-opacity duration-300 pointer-events-none ${
          (showControls || !isPlaying) && !isInitialLoad ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {/* Crimson Red Vertical Bar from Screenshot */}
          <div className="w-[3px] h-9 rounded-full bg-[#e11d2e] shadow-[0_0_8px_rgba(225,29,46,0.6)]" />
          <div className="flex flex-col">
            <span className="text-[11px] font-medium tracking-wide text-white/50 drop-shadow">
              You're Watching
            </span>
            <span className="text-sm sm:text-base font-semibold text-white drop-shadow truncate max-w-[200px] sm:max-w-md">
              {title}
            </span>
          </div>
        </div>
      </div>

      {/* 4. TOP-RIGHT SERVERS BUTTON */}
      <div 
        className={`absolute top-4 right-4 z-40 transition-opacity duration-300 ${
          showControls || !isPlaying || isInitialLoad || !!error ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="relative">
          <button
            type="button"
            aria-label="Server selection"
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'servers' ? null : 'servers');
            }}
            className="p-2 text-white/90 hover:text-white transition rounded-xl bg-black/40 hover:bg-black/70 border border-white/10 backdrop-blur-md shadow-lg"
            title="Switch Server"
          >
            <ServersIcon className="size-6 text-white drop-shadow" />
          </button>

          {activeMenu === 'servers' && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-zinc-900/98 backdrop-blur-xl border border-white/15 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-2 py-1 text-[11px] font-semibold text-white/50 uppercase tracking-wider flex items-center justify-between">
                <span>Select Stream Server</span>
                <span className="text-[10px] text-emerald-400 font-mono">{sources.length} Available</span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-1 mt-1.5 custom-scrollbar">
                {sources.map((src, idx) => {
                  const isFailed = failedSourcesRef.current.has(idx);
                  const isCurrent = idx === selectedSourceIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => switchServer(idx)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                        isCurrent
                          ? 'bg-[#e11d2e]/25 text-white font-bold border border-[#e11d2e]/40'
                          : isFailed
                          ? 'text-white/40 hover:bg-white/5 hover:text-white/60'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-[#e11d2e]' : isFailed ? 'bg-rose-500/50' : 'bg-emerald-400'}`} />
                        <span className="truncate">{src.label || src.server}</span>
                      </div>
                      <span className="text-[10px] opacity-70 ml-2 font-mono">
                        {isFailed ? 'Offline' : src.quality || 'Auto'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. BACK BUTTON SIMULATION (HIDDEN BY DEFAULT AS USER REQUESTED) */}
      {showBackButtonSimulation && (
        <button
          type="button"
          aria-label="Back"
          onClick={() => alert("Original Back button clicked!")}
          className="absolute left-4 top-16 z-[70] p-1.5 text-white/80 hover:text-white flex items-center gap-1.5 text-xs bg-black/50 rounded-lg border border-white/20"
        >
          <span>←</span> <span>Back</span>
        </button>
      )}

      {/* 6. TGFLIX WATERMARK SIMULATION (REMOVED BY DEFAULT AS USER REQUESTED) */}
      {showWatermarkSimulation && (
        <a
          href="https://discord.gg/AMTnN7dd64"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute left-1/2 top-4 z-[60] -translate-x-1/2 select-none px-2 py-0.5 font-black text-sm tracking-[0.25em] text-[#e11d2e] opacity-70"
          style={{ fontFamily: 'Audiowide, sans-serif' }}
        >
          TGFLIX
        </a>
      )}

      {/* 7. EXACT PAUSED TITLE INFORMATION OVERLAY (TMDB DATA WITHOUT OVERLAP) */}
      {/* 7. EXACT PAUSED TITLE INFORMATION OVERLAY (TMDB DATA WITHOUT OVERLAP) */}
      {!isPlaying && !isInitialLoad && (
        <div 
          className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-center px-6 sm:px-12 bg-gradient-to-r from-black/85 via-black/40 to-transparent animate-[fadeIn_0.2s_ease-out]"
          style={{ animation: '0.18s ease-out pauseInfoAppear' }}
        >
          {/* Properly positioned with top padding to guarantee ZERO OVERLAP with the top header! */}
          <div className="max-w-md sm:max-w-xl space-y-2.5 pt-6">
            {/* PAUSED label in subtle clean gray */}
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#a3a3a3] drop-shadow-md">
              PAUSED
            </p>

            {/* Transparent Movie Title Logo PNG (Floating background-removed logo with fallback) */}
            {meta?.logo ? (
              <div className="py-1">
                <img
                  src={meta.logo}
                  alt={title}
                  className="max-h-16 sm:max-h-24 max-w-[280px] sm:max-w-[420px] object-contain object-left drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallbackEl = document.getElementById('pause-title-fallback');
                    if (fallbackEl) fallbackEl.style.display = 'block';
                  }}
                />
                <h1 
                  id="pause-title-fallback"
                  className="hidden text-2xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] truncate"
                >
                  {title}
                </h1>
              </div>
            ) : (
              <h1 
                className="text-2xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] truncate"
              >
                {title}
              </h1>
            )}

            {/* Year & Star Rating Row: "2026  ·  ★ 8.1" */}
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-white/90 drop-shadow">
              <span>{meta?.year || '2026'}</span>
              <span className="text-white/40">·</span>
              <span className="flex items-center gap-1 text-white">
                <span className="text-amber-400">★</span>
                <span>{meta?.rating || '8.1'}</span>
              </span>
            </div>

            {/* Rounded Pill Genre Chips: "Family", "Drama" */}
            {meta?.genres && meta.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {meta.genres.slice(0, 3).map((genre, i) => (
                  <span
                    key={i}
                    className="px-3.5 py-1 rounded-full text-xs font-semibold text-white/95 border border-white/20 bg-white/10 backdrop-blur-md shadow-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. CENTER PLAYBACK CONTROLS (Trio: ↺15  ▶/⏸  ↻15 in Exact Screenshot Layout) */}
      <div 
        className={`absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-300 ${
          (showControls || !isPlaying) && !isInitialLoad
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-6 sm:gap-10">
          {/* Rewind 15s */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              seekBy(-15);
              showControlsTemporarily();
            }}
            className="p-2 text-white/90 hover:text-white transition transform hover:scale-110 active:scale-95 drop-shadow-lg cursor-pointer"
            title="Rewind 15s"
          >
            <Backward15Icon className="size-8 sm:size-9" />
          </button>

          {/* Large Solid White Play / Pause Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
              showControlsTemporarily();
            }}
            className="p-3 text-white transition transform hover:scale-115 active:scale-95 drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)] cursor-pointer"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <CenterPauseIcon className="size-14 sm:size-16 fill-white" />
            ) : (
              <CenterPlayIcon className="size-14 sm:size-16 fill-white" />
            )}
          </button>

          {/* Forward 15s */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              seekBy(15);
              showControlsTemporarily();
            }}
            className="p-2 text-white/90 hover:text-white transition transform hover:scale-110 active:scale-95 drop-shadow-lg cursor-pointer"
            title="Forward 15s"
          >
            <Forward15Icon className="size-8 sm:size-9" />
          </button>
        </div>
      </div>

      {/* 9. EXACT BOTTOM CONTROLS & TIMELINE INDICATOR */}
      <div
        className={`absolute bottom-0 inset-x-0 z-20 px-4 sm:px-6 pb-4 pt-8 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col gap-2 transition-opacity duration-300 ${
          (showControls || !isPlaying) && !isInitialLoad ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* EXACT TIMELINE ROW */}
        <div className="group/bar pointer-events-auto flex w-full items-center">
          <div
            ref={progressBarRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onPointerLeave={() => {
              if (!isDraggingRef.current) {
                setShowSeekPreview(false);
                setHoverPosition(null);
                setHoverTime(null);
              }
            }}
            className="relative h-6 flex-1 cursor-pointer touch-none"
          >
            {/* Thumbnail Seek Preview with Video Scene & Timestamp */}
            <div
              className={`pointer-events-none absolute bottom-full z-50 mb-3 -translate-x-1/2 flex flex-col items-center transition-all duration-150 ${
                showSeekPreview && hoverPosition !== null && hoverTime !== null
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-95 pointer-events-none'
              }`}
              style={{
                left: `clamp(90px, ${hoverPosition ?? 0}px, calc(100% - 90px))`,
              }}
            >
              <div className="relative w-36 sm:w-44 aspect-video rounded-lg overflow-hidden bg-black/95 border-2 border-white/40 shadow-[0_8px_24px_rgba(0,0,0,0.9)] flex items-center justify-center">
                {/* Fallback backdrop poster image */}
                {meta?.backdrop && (
                  <img
                    src={meta.backdrop}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                )}
                {/* Secondary video element displaying exact scene at timestamp */}
                <video
                  ref={previewVideoRef}
                  muted
                  playsInline
                  preload="auto"
                  onSeeking={() => {
                    previewSeekingRef.current = true;
                    setIsPreviewLoading(true);
                  }}
                  onSeeked={() => {
                    previewSeekingRef.current = false;
                    setIsPreviewLoading(false);
                    if (pendingPreviewTimeRef.current !== null) {
                      const nextTime = pendingPreviewTimeRef.current;
                      pendingPreviewTimeRef.current = null;
                      requestPreviewSeek(nextTime);
                    }
                  }}
                  onError={() => {
                    previewSeekingRef.current = false;
                    setIsPreviewLoading(false);
                  }}
                  className="absolute inset-0 w-full h-full object-cover z-10"
                />
                {/* Subtle loading spinner while fetching exact frame */}
                {isPreviewLoading && (
                  <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="size-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  </div>
                )}
                {/* Timestamp badge */}
                <div className="absolute bottom-1 right-1 z-30 bg-black/85 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-mono text-white border border-white/20 shadow">
                  {formatTime(hoverTime ?? currentTime)}
                </div>
              </div>
              <div className="w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-white/40 -mt-[1px]" />
            </div>

            {/* Background Track with hover expansion */}
            <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/25 transition-transform duration-150 group-hover/bar:scale-y-125">
              {/* Buffer Bar */}
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-white/35"
                style={{ width: `${bufferedPercent}%` }}
              />

              {/* Active Progress Bar (Exact Crimson Red #e11d2e) */}
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[#e11d2e]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* EXACT RECTANGULAR THUMB INDICATOR: h-3.5 w-1.5 rounded-[1px] bg-white */}
            <div
              className="absolute top-1/2 z-10 h-3.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-[1px] bg-white shadow-[0_0_6px_rgba(0,0,0,0.8)] transition-transform duration-150 group-hover/bar:scale-[1.25]"
              style={{ left: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* TIME ROW: CURRENT TIME (LEFT) & DURATION (RIGHT) - EXACT SCREENSHOT */}
        <div className="flex w-full justify-between items-center px-0.5 text-xs sm:text-sm font-mono text-white/80 tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* BOTTOM CENTERED CONTROLS ROW - 5 ICONS FROM SCREENSHOT */}
        <div className="flex items-center justify-center gap-5 sm:gap-8 pt-1">
          {/* 1. Volume Icon with Slide-out Slider */}
          <div className="group/vol relative flex items-center">
            <button
              type="button"
              aria-label="Volume"
              onClick={() => {
                if (videoRef.current) {
                  const newMute = !isMuted;
                  videoRef.current.muted = newMute;
                  setIsMuted(newMute);
                }
              }}
              className="p-1.5 text-white/80 hover:text-white transition"
              title="Volume"
            >
              {isMuted || volume === 0 ? <VolumeMuteIcon /> : <VolumeIcon />}
            </button>
            <div className="pointer-events-auto hidden w-0 overflow-hidden opacity-0 transition-all duration-200 group-hover/vol:w-[85px] group-hover/vol:opacity-100 md:block ml-1">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  setIsMuted(v === 0);
                  if (videoRef.current) {
                    videoRef.current.volume = v;
                    videoRef.current.muted = v === 0;
                  }
                }}
                className="h-1.5 w-[85px] cursor-pointer accent-white"
              />
            </div>
          </div>

          {/* 2. Subtitles CC / Audio Tracks Icon */}
          <div className="relative">
            <button
              type="button"
              aria-label="Subtitles & Audio"
              onClick={() => setActiveMenu(activeMenu === 'audio' ? null : 'audio')}
              className={`p-1.5 text-white/80 hover:text-white transition ${activeMenu === 'audio' ? 'text-[#e11d2e]' : ''}`}
              title="Subtitles & Audio"
            >
              <SubtitlesIcon />
            </button>
            {activeMenu === 'audio' && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-48 rounded-xl bg-zinc-900/95 backdrop-blur-md border border-white/10 shadow-2xl p-2 z-50">
                <div className="px-2 py-1 text-[10px] font-semibold text-white/40 uppercase">Audio Tracks</div>
                {audioTracks.length > 0 ? (
                  audioTracks.map((tr) => (
                    <button
                      key={tr.id}
                      onClick={() => {
                        if (hlsRef.current) hlsRef.current.audioTrack = tr.id;
                        setCurrentAudio(tr.id);
                        setActiveMenu(null);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between ${
                        currentAudio === tr.id ? 'bg-[#e11d2e]/20 text-[#e11d2e] font-bold' : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <span>{tr.name}</span>
                      {currentAudio === tr.id && <span>✓</span>}
                    </button>
                  ))
                ) : (
                  <p className="px-2 py-1 text-xs text-white/50">Default Audio Track</p>
                )}
              </div>
            )}
          </div>

          {/* 3. HD Quality Badge Icon */}
          <div className="relative">
            <button
              type="button"
              aria-label="Quality"
              onClick={() => setActiveMenu(activeMenu === 'quality' ? null : 'quality')}
              className={`p-1.5 text-white/80 hover:text-white transition ${activeMenu === 'quality' ? 'text-[#e11d2e]' : ''}`}
              title="Stream Quality"
            >
              <HdQualityIcon />
            </button>
            {activeMenu === 'quality' && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-36 rounded-xl bg-zinc-900/95 backdrop-blur-md border border-white/10 shadow-2xl p-2 z-50">
                <div className="px-2 py-1 text-[10px] font-semibold text-white/40 uppercase">Quality</div>
                {qualityLevels.map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      if (hlsRef.current) hlsRef.current.currentLevel = lvl.id;
                      setCurrentQuality(lvl.id);
                      setActiveMenu(null);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs flex items-center justify-between ${
                      currentQuality === lvl.id ? 'bg-[#e11d2e]/20 text-[#e11d2e] font-bold' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <span>{lvl.name}</span>
                    {currentQuality === lvl.id && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. Settings Gear Icon */}
          <div className="relative">
            <button
              type="button"
              aria-label="Settings"
              onClick={() => setActiveMenu(activeMenu === 'speed' ? null : 'speed')}
              className={`p-1.5 text-white/80 hover:text-white transition ${activeMenu === 'speed' ? 'text-[#e11d2e]' : ''}`}
              title="Speed Settings"
            >
              <SettingsGearIcon />
            </button>
            {activeMenu === 'speed' && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-32 rounded-xl bg-zinc-900/95 backdrop-blur-md border border-white/10 shadow-2xl p-2 z-50">
                <div className="px-2 py-1 text-[10px] font-semibold text-white/40 uppercase">Speed</div>
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      if (videoRef.current) videoRef.current.playbackRate = rate;
                      setPlaybackRate(rate);
                      setActiveMenu(null);
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between ${
                      playbackRate === rate ? 'bg-[#e11d2e]/20 text-[#e11d2e] font-bold' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <span>{rate}x</span>
                    {playbackRate === rate && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. Fullscreen Expand Icon */}
          <button
            type="button"
            aria-label="Fullscreen"
            onClick={toggleFullscreen}
            className="p-1.5 text-white/80 hover:text-white transition"
            title="Toggle Fullscreen"
          >
            <FullscreenIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
