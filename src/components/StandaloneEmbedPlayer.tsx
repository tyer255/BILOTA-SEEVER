import React, { useEffect, useState } from 'react';
import { fetchDirectSources, fetchTmdbMeta, TgvidResponse, MediaMeta } from '../services/tgvid';
import { CleanPlayer } from './CleanPlayer';

interface StandaloneEmbedPlayerProps {
  type: 'movie' | 'tv';
  id: string | number;
  season?: number;
  episode?: number;
}

/**
 * Standalone, 100% full-viewport player designed specifically for embedding
 * in any external website, mobile webview, or iframe.
 * - Zero ads
 * - No Back Button
 * - No TGFLIX watermark
 * - Native HLS streaming with audio, server, and quality selector
 */
export const StandaloneEmbedPlayer: React.FC<StandaloneEmbedPlayerProps> = ({
  type,
  id,
  season = 1,
  episode = 1,
}) => {
  const [sources, setSources] = useState<TgvidResponse | null>(null);
  const [meta, setMeta] = useState<MediaMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchDirectSources(type, id, season, episode),
      fetchTmdbMeta(type, id)
    ])
      .then(([sourcesRes, metaRes]) => {
        if (!isMounted) return;
        setSources(sourcesRes);
        setMeta(metaRes);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error(err);
        setError(err.message || 'Failed to load video stream');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [type, id, season, episode]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white overflow-hidden select-none">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.85) 90%)',
          }}
        />
        <div className="relative flex flex-col items-center justify-center px-6 text-center">
          <p
            className="text-[13px] sm:text-[15px] uppercase tracking-wide text-white mb-6"
            style={{ fontFamily: 'Audiowide, sans-serif' }}
          >
            Connecting to Stream Server
            <span className="animate-pulse inline-block ml-1">_</span>
          </p>
          <div className="relative h-[4px] w-[260px] max-w-[70vw] overflow-hidden rounded-full bg-white/20">
            <div className="absolute inset-y-0 w-1/3 rounded-full bg-white animate-vsSlide" />
          </div>
          <p className="mt-4 text-xs text-white/50 tracking-wider">
            TMDB #{id} · Direct Source Extraction
          </p>
        </div>
      </div>
    );
  }

  if (error || !sources || !sources.links || sources.links.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="max-w-md space-y-3">
          <p className="text-sm font-semibold text-rose-400">{error || 'No playable stream found'}</p>
          <p className="text-xs text-white/50">
            Please check the TMDB ID ({id}) or try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition"
          >
            Reload Stream
          </button>
        </div>
      </div>
    );
  }

  const title = meta?.title || sources.title || `${type === 'movie' ? 'Movie' : 'TV'} #${id}`;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none">
      <CleanPlayer
        sources={sources.links}
        meta={meta || undefined}
        title={title}
        showBackButtonSimulation={false}
        showWatermarkSimulation={false}
      />
    </div>
  );
};
