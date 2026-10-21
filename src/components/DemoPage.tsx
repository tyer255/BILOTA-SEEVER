import React, { useState, useEffect } from 'react';
import { 
  Film, Tv, Play, Copy, Check, Sliders, ExternalLink, 
  Sparkles, AlertCircle, RefreshCw, Layers, ShieldCheck, Palette
} from 'lucide-react';
import { 
  fetchDirectSources, fetchTmdbMeta, PRESET_ITEMS, 
  TgvidResponse, MediaMeta, PresetItem 
} from '../services/tgvid';
import { CleanPlayer } from './CleanPlayer';

interface DemoPageProps {
  initialPreset?: PresetItem;
}

export const DemoPage: React.FC<DemoPageProps> = ({ initialPreset }) => {
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>(initialPreset?.type || 'movie');
  const [contentId, setContentId] = useState<string>(initialPreset ? String(initialPreset.id) : '550');
  const [season, setSeason] = useState<number>(initialPreset?.season || 1);
  const [episode, setEpisode] = useState<number>(initialPreset?.episode || 1);

  // Grouped configurable parameters
  const [autoplay, setAutoplay] = useState<boolean>(true);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const [accentColor, setAccentColor] = useState<string>('#e11d2e');
  const [audioPriority, setAudioPriority] = useState<string>('multi');

  // Stream data & Player state
  const [sourcesData, setSourcesData] = useState<TgvidResponse | null>(null);
  const [meta, setMeta] = useState<MediaMeta | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [embedCopied, setEmbedCopied] = useState<boolean>(false);

  // Quick preset shortcuts for fast testing
  const quickPresets = [
    { label: 'Fight Club (Movie #550)', type: 'movie' as const, id: '550', s: 1, e: 1 },
    { label: 'Jujutsu Kaisen (Anime #95479)', type: 'tv' as const, id: '95479', s: 1, e: 1 },
    { label: 'Breaking Bad (Series #1396)', type: 'tv' as const, id: '1396', s: 1, e: 1 },
    { label: 'Dune: Part Two (Movie #693134)', type: 'movie' as const, id: '693134', s: 1, e: 1 },
    { label: 'Stranger Things (Series #66732)', type: 'tv' as const, id: '66732', s: 1, e: 1 },
    { label: 'Interstellar (Movie #157336)', type: 'movie' as const, id: '157336', s: 1, e: 1 },
  ];

  // Accent color choices
  const colorOptions = [
    { label: 'Red (Default)', value: '#e11d2e' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Cyan', value: '#06b6d4' },
    { label: 'Violet', value: '#8b5cf6' },
  ];

  const loadStream = async (type: 'movie' | 'tv', id: string, s: number, ep: number) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const [sourcesRes, metaRes] = await Promise.all([
        fetchDirectSources(type, id.trim(), s, ep),
        fetchTmdbMeta(type, id.trim()),
      ]);
      setSourcesData(sourcesRes);
      setMeta(metaRes);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch video streams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPreset) {
      setMediaType(initialPreset.type);
      setContentId(String(initialPreset.id));
      if (initialPreset.season) setSeason(initialPreset.season);
      if (initialPreset.episode) setEpisode(initialPreset.episode);
      loadStream(initialPreset.type, String(initialPreset.id), initialPreset.season || 1, initialPreset.episode || 1);
    } else {
      loadStream('movie', '550', 1, 1);
    }
  }, [initialPreset]);

  const handleApplyConfig = (e: React.FormEvent) => {
    e.preventDefault();
    loadStream(mediaType, contentId, season, episode);
  };

  const handleSelectQuickPreset = (preset: typeof quickPresets[0]) => {
    setMediaType(preset.type);
    setContentId(preset.id);
    setSeason(preset.s);
    setEpisode(preset.e);
    loadStream(preset.type, preset.id, preset.s, preset.e);
  };

  // Build the generated Bilota Server embed URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://bilotaserver.ai.studio';
  const generatedEmbedUrl = mediaType === 'movie'
    ? `${baseUrl}/?embed=true&type=movie&id=${contentId || '550'}${autoplay ? '&autoplay=true' : ''}`
    : `${baseUrl}/?embed=true&type=tv&id=${contentId || '1396'}&s=${season}&e=${episode}${autoplay ? '&autoplay=true' : ''}`;

  const generatedIframeCode = `<iframe
  src="${generatedEmbedUrl}"
  width="100%"
  height="100%"
  frameborder="0"
  allow="autoplay; fullscreen; picture-in-picture"
  allowfullscreen
></iframe>`;

  const copyToClipboard = (text: string, type: 'url' | 'iframe') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    }
  };

  const activeTitle = meta?.title || sourcesData?.title || `${mediaType === 'movie' ? 'Movie' : 'Series'} #${contentId}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header: Title and Short Subtitle */}
      <div className="mb-8 sm:mb-10 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
          <Sliders className="w-3.5 h-3.5" />
          <span>Live Interactive Sandbox</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Demo &amp; Stream Configuration
        </h1>
        <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-2xl">
          Test real-time stream extraction, customize player parameters, and copy ready-to-use iframe embed codes.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN — Configuration Panel */}
        <div className="lg:col-span-5 space-y-6">
          <form 
            onSubmit={handleApplyConfig}
            className="p-5 sm:p-6 rounded-2xl bg-[#0c1017]/90 border border-white/10 shadow-xl space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Configuration Panel</span>
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">TMDB API V3</span>
            </div>

            {/* 1. Media Type Selector */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-zinc-300">Media Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMediaType('movie')}
                  className={`py-2.5 px-3 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    mediaType === 'movie'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'bg-zinc-900/80 text-zinc-400 border border-white/5 hover:bg-zinc-800'
                  }`}
                >
                  <Film className="w-4 h-4" />
                  <span>Movie</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMediaType('tv')}
                  className={`py-2.5 px-3 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    mediaType === 'tv'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'bg-zinc-900/80 text-zinc-400 border border-white/5 hover:bg-zinc-800'
                  }`}
                >
                  <Tv className="w-4 h-4" />
                  <span>TV Show</span>
                </button>
              </div>
            </div>

            {/* 2. Content ID Input */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300">Content ID (TMDB ID)</label>
                <span className="text-[11px] text-zinc-500">e.g. 550, 95479, 1396</span>
              </div>
              <input
                type="text"
                value={contentId}
                onChange={(e) => setContentId(e.target.value)}
                placeholder="Enter TMDB ID..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
              />
            </div>

            {/* 3. Season and Episode Inputs (when TV is selected) */}
            {mediaType === 'tv' && (
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Season</label>
                  <input
                    type="number"
                    min="1"
                    value={season}
                    onChange={(e) => setSeason(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Episode</label>
                  <input
                    type="number"
                    min="1"
                    value={episode}
                    onChange={(e) => setEpisode(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/90 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>
            )}

            {/* 4. Grouped Configurable Parameters */}
            <div className="pt-2 border-t border-white/10 space-y-3 text-left">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Player Parameters
              </span>

              {/* Autoplay & Subtitles Toggles */}
              <div className="grid grid-cols-2 gap-2.5">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-white/5 cursor-pointer hover:bg-zinc-900">
                  <span className="text-xs text-zinc-300 font-medium">Autoplay</span>
                  <input
                    type="checkbox"
                    checked={autoplay}
                    onChange={(e) => setAutoplay(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500/20 bg-zinc-800 border-zinc-700"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-white/5 cursor-pointer hover:bg-zinc-900">
                  <span className="text-xs text-zinc-300 font-medium">Subtitles</span>
                  <input
                    type="checkbox"
                    checked={showSubtitles}
                    onChange={(e) => setShowSubtitles(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500/20 bg-zinc-800 border-zinc-700"
                  />
                </label>
              </div>

              {/* Accent Color Selection */}
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Player Accent Color</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAccentColor(opt.value)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                        accentColor === opt.value
                          ? 'border-white bg-white/10 text-white'
                          : 'border-white/5 bg-zinc-900/50 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: opt.value }} />
                      <span className="truncate">{opt.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Action Button to Load or Apply Configuration */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Extracting Stream Links...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black text-black" />
                  <span>Apply &amp; Load Stream</span>
                </>
              )}
            </button>
          </form>

          {/* Quick-Select Presets Card */}
          <div className="p-4 rounded-xl bg-[#0c1017]/60 border border-white/5 text-left space-y-2.5">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
              Quick Test Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {quickPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectQuickPreset(preset)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    contentId === preset.id && mediaType === preset.type
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold'
                      : 'bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Preview Area */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Live Player Preview Container */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1017]/90 border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                  {activeTitle}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {sourcesData?.links?.length || 0} Sources
                </span>
                <a
                  href={generatedEmbedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 p-1 hover:bg-white/5 rounded"
                  title="Open Embed in New Tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Dedicated Player Frame */}
            <div 
              className="rounded-xl overflow-hidden bg-black border border-white/10 shadow-inner relative"
              style={{
                '--vs-red': accentColor,
              } as React.CSSProperties}
            >
              {loading ? (
                <div className="w-full aspect-video flex flex-col items-center justify-center gap-3 bg-zinc-950 text-white">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                  <p className="text-xs text-zinc-400 font-mono">Loading streams for {activeTitle}...</p>
                </div>
              ) : error ? (
                <div className="w-full aspect-video flex flex-col items-center justify-center gap-3 bg-zinc-950 text-rose-400 p-6 text-center">
                  <AlertCircle className="w-8 h-8 text-rose-400" />
                  <p className="text-sm font-semibold">{error}</p>
                  <button
                    onClick={() => loadStream(mediaType, contentId, season, episode)}
                    className="px-4 py-2 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white hover:bg-zinc-800"
                  >
                    Retry Loading
                  </button>
                </div>
              ) : sourcesData && sourcesData.links && sourcesData.links.length > 0 ? (
                <CleanPlayer
                  sources={sourcesData.links}
                  meta={meta || undefined}
                  title={activeTitle}
                />
              ) : (
                <div className="w-full aspect-video flex flex-col items-center justify-center gap-2 bg-zinc-950 text-zinc-400">
                  <AlertCircle className="w-8 h-8 text-amber-400" />
                  <p className="text-xs font-mono">No video sources returned for TMDB #{contentId}</p>
                </div>
              )}
            </div>

            {/* Metadata Pills */}
            {meta && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 pt-1">
                {meta.year && (
                  <span className="px-2 py-0.5 rounded bg-white/5 font-mono text-zinc-300">
                    {meta.year}
                  </span>
                )}
                {meta.rating && (
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono">
                    ★ {meta.rating}
                  </span>
                )}
                {meta.genres && meta.genres.slice(0, 3).map((g) => (
                  <span key={g} className="px-2 py-0.5 rounded bg-white/5 text-zinc-300">
                    {g}
                  </span>
                ))}
                {meta.overview && (
                  <p className="text-xs text-zinc-500 line-clamp-2 mt-1 text-left w-full">
                    {meta.overview}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Display Generated URL with Copy Option */}
          <div className="p-5 rounded-2xl bg-[#0c1017]/90 border border-white/10 shadow-lg space-y-4 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5 text-emerald-400" />
                <span>Generated Embed URL</span>
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(generatedEmbedUrl, 'url')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied URL!' : 'Copy URL'}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-black/60 border border-white/5 font-mono text-xs text-zinc-300 break-all select-all">
              {generatedEmbedUrl}
            </div>

            {/* Quick iframe code embed block */}
            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-400">HTML Iframe Embed Code</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedIframeCode, 'iframe')}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                >
                  {embedCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{embedCopied ? 'Copied Code!' : 'Copy HTML'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-black/60 border border-white/5 font-mono text-[11px] text-zinc-400 overflow-x-auto">
                <code>{generatedIframeCode}</code>
              </pre>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
